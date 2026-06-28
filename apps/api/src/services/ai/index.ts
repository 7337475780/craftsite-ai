import type {
  EditWebsiteInput,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
  AIProviderAttempt,
  AIProviderName,
  AIMode,
} from "./ai-provider.js";

import { AIProviderError } from "./ai-provider.js";
import { getProvider, getProviderChain } from "./provider-registry.js";
import { validateGeneratedCode, repairCommonCodeIssues, scoreGeneratedUIQuality, detectResponsiveIssues } from "./code-utils.js";
import { MockProvider } from "./mock.provider.js";
import { env } from "../../config/env.js";
import { isModelCoolingDown } from "./model-cooldown.js";

export async function generateWebsiteWithAI(
  input: GenerateWebsiteInput & { aiMode?: AIMode; aiProvider?: AIProviderName | "auto" }
): Promise<GenerateWebsiteOutput> {
  const providerConfig = input.aiProvider || env.AI_PROVIDER || "auto";
  const selectedMode = input.aiMode || env.AI_MODE || "balanced";
  // Read at request time so tests can mutate process.env
  const allowMockFallback = process.env.ALLOW_MOCK_FALLBACK === "true";
  const providerAttempts: AIProviderAttempt[] = [];

  // 1. Build the queue of provider names to try
  const queue: AIProviderName[] = [];
  if (providerConfig !== "auto") {
    queue.push(providerConfig);
  } else {
    const chain = getProviderChain(selectedMode);
    for (const name of chain) {
      if (name === "mock") continue; // mock handled separately at the end
      const p = getProvider(name);
      if (p.isConfigured()) {
        queue.push(name);
      } else {
        console.log(`[AI Orchestrator] Skipping provider ${name} (not configured)`);
      }
    }
  }

  // 2. Iterate each provider in the queue
  for (const providerName of queue) {
    if (providerName === "mock") continue;

    let p;
    try {
      p = getProvider(providerName);
    } catch (err: any) {
      console.warn(`[AI Orchestrator] Failed to instantiate provider ${providerName}: ${err.message}`);
      continue;
    }

    const models = p.getModels();

    for (const modelName of models) {
      if (isModelCoolingDown(providerName, modelName)) {
        console.warn(`[AI Orchestrator] Skipping provider: ${providerName}, model: ${modelName} (cooling down)`);
        providerAttempts.push({
          provider: providerName,
          model: modelName,
          success: false,
          errorType: "cooldown",
          durationMs: 0,
        });
        continue;
      }

      const startTime = Date.now();
      console.log(`[AI Orchestrator] Attempting provider: ${providerName}, model: ${modelName}`);

      try {
        const providerInstance = getProvider(providerName, modelName);
        const result = await providerInstance.generateWebsite(input);

        const isFallback = false; // isFallback is only true when mock is used

        // Helper to check validity and quality
        const evaluateCode = (code: string) => {
          let finalCode = code;
          let isValid = validateGeneratedCode(finalCode);
          if (!isValid) {
            const locallyRepaired = repairCommonCodeIssues(finalCode);
            if (validateGeneratedCode(locallyRepaired)) {
              isValid = true;
              finalCode = locallyRepaired;
            }
          }

          if (!isValid) return { isValid: false, finalCode, score: 0, issues: [] };

          const { score, issues } = scoreGeneratedUIQuality(finalCode, input.websiteType);
          const responsiveIssues = detectResponsiveIssues(finalCode);
          const allIssues = [...issues, ...responsiveIssues];

          return { isValid: true, finalCode, score, issues: allIssues };
        };

        const eval1 = evaluateCode(result.generatedCode);

        if (eval1.isValid && eval1.score >= 75 && !eval1.issues.some(i => i.toLowerCase().includes("responsive") || i.includes("fallback"))) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
            qualityScore: eval1.score,
            qualityIssues: eval1.issues
          });
          return {
            generatedCode: eval1.finalCode,
            provider: providerName,
            model: modelName,
            isFallback,
            providerAttempts,
          };
        }

        if (providerInstance.repairWebsite) {
          const isUIError = eval1.isValid;
          console.warn(`[AI Orchestrator] ${isUIError ? `UI quality low (Score: ${eval1.score})` : 'Code invalid'}. Prompting repair...`);
          
          const repairResult = await providerInstance.repairWebsite(
            isUIError ? eval1.finalCode : result.generatedCode,
            false,
            isUIError ? eval1.issues : undefined
          );

          const eval2 = evaluateCode(repairResult.generatedCode);

          // For repair, if it's a syntax issue we just want it valid. If it's UI we want it >= 75
          if (eval2.isValid && (isUIError ? eval2.score >= 75 : true)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
              qualityScore: eval2.score,
              qualityIssues: eval2.issues
            });
            return {
              generatedCode: eval2.finalCode,
              provider: providerName,
              model: modelName,
              isFallback,
              providerAttempts,
            };
          }
        }

        throw new AIProviderError(
          eval1.isValid ? `Model generated code that failed UI quality checks (Score: ${eval1.score})` : "Model generated code that failed validation checks",
          providerName,
          modelName,
          eval1.isValid ? "low_quality_ui" : "invalid_code"
        );
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorType = error instanceof AIProviderError ? error.errorType : "unknown";

        console.warn(
          `[AI Orchestrator] Provider attempt failed: ${providerName} / ${modelName}. ErrorType: ${errorType}. Error: ${error.message}`
        );

        providerAttempts.push({
          provider: providerName,
          model: modelName,
          success: false,
          errorType,
          errorMessage: process.env.NODE_ENV === "development" ? error.message : undefined,
          durationMs: duration,
        });
      }
    }
  }

  // 3. Fallback to Mock
  if (providerConfig === "mock" || allowMockFallback) {
    console.warn("[AI Orchestrator] All real models failed or Mock explicitly selected. Falling back to Mock.");
    const startTime = Date.now();
    const mockResult = await new MockProvider().generateWebsite(input);
    const duration = Date.now() - startTime;
    providerAttempts.push({
      provider: "mock",
      model: "mock-safe-fallback",
      success: true,
      durationMs: duration,
    });
    return {
      generatedCode: mockResult.generatedCode,
      provider: "mock",
      model: "mock-safe-fallback",
      isFallback: true,
      providerAttempts,
    };
  }

  // 4. Return custom status if fallback disabled
  const err = new Error("All AI providers failed and fallback is disabled.") as any;
  err.status = 502;
  err.providerAttempts = providerAttempts;
  throw err;
}

export async function editWebsiteWithAI(
  input: EditWebsiteInput & { aiMode?: AIMode; aiProvider?: AIProviderName | "auto" }
): Promise<GenerateWebsiteOutput> {
  const providerConfig = input.aiProvider || env.AI_PROVIDER || "auto";
  const selectedMode = input.aiMode || env.AI_MODE || "balanced";
  // Read at request time so tests can mutate process.env
  const allowMockFallback = process.env.ALLOW_MOCK_FALLBACK === "true";
  const providerAttempts: AIProviderAttempt[] = [];

  const queue: AIProviderName[] = [];
  if (providerConfig !== "auto") {
    queue.push(providerConfig);
  } else {
    const chain = getProviderChain(selectedMode);
    for (const name of chain) {
      if (name === "mock") continue;
      const p = getProvider(name);
      if (p.isConfigured()) {
        queue.push(name);
      } else {
        console.log(`[AI Orchestrator] Skipping provider ${name} (not configured)`);
      }
    }
  }

  for (const providerName of queue) {
    if (providerName === "mock") continue;

    let p;
    try {
      p = getProvider(providerName);
    } catch (err: any) {
      console.warn(`[AI Orchestrator] Failed to instantiate provider ${providerName}: ${err.message}`);
      continue;
    }

    const models = p.getModels();

    for (const modelName of models) {
      if (isModelCoolingDown(providerName, modelName)) {
        console.warn(`[AI Orchestrator] Skipping provider: ${providerName}, model: ${modelName} (cooling down)`);
        providerAttempts.push({
          provider: providerName,
          model: modelName,
          success: false,
          errorType: "cooldown",
          durationMs: 0,
        });
        continue;
      }

      const startTime = Date.now();
      console.log(`[AI Orchestrator] Attempting edit provider: ${providerName}, model: ${modelName}`);

      try {
        const providerInstance = getProvider(providerName, modelName);
        const result = await providerInstance.editWebsite(input);

        const isFallback = providerAttempts.some((a) => !a.success);

        // Helper to check validity and quality
        const evaluateCode = (code: string) => {
          let finalCode = code;
          let isValid = validateGeneratedCode(finalCode);
          if (!isValid) {
            const locallyRepaired = repairCommonCodeIssues(finalCode);
            if (validateGeneratedCode(locallyRepaired)) {
              isValid = true;
              finalCode = locallyRepaired;
            }
          }

          if (!isValid) return { isValid: false, finalCode, score: 0, issues: [] };

          const { score, issues } = scoreGeneratedUIQuality(finalCode);
          const responsiveIssues = detectResponsiveIssues(finalCode);
          const allIssues = [...issues, ...responsiveIssues];

          return { isValid: true, finalCode, score, issues: allIssues };
        };

        const eval1 = evaluateCode(result.generatedCode);

        if (eval1.isValid && eval1.score >= 75 && !eval1.issues.some(i => i.toLowerCase().includes("responsive") || i.includes("fallback"))) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
            qualityScore: eval1.score,
            qualityIssues: eval1.issues
          });
          return {
            generatedCode: eval1.finalCode,
            provider: providerName,
            model: modelName,
            isFallback,
            providerAttempts,
          };
        }

        if (providerInstance.repairWebsite) {
          const isUIError = eval1.isValid;
          console.warn(`[AI Orchestrator] Edit: ${isUIError ? `UI quality low (Score: ${eval1.score})` : 'Code invalid'}. Prompting repair...`);
          
          const repairResult = await providerInstance.repairWebsite(
            isUIError ? eval1.finalCode : result.generatedCode,
            true,
            isUIError ? eval1.issues : undefined
          );

          const eval2 = evaluateCode(repairResult.generatedCode);

          if (eval2.isValid && (isUIError ? eval2.score >= 75 : true)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
              qualityScore: eval2.score,
              qualityIssues: eval2.issues
            });
            return {
              generatedCode: eval2.finalCode,
              provider: providerName,
              model: modelName,
              isFallback,
              providerAttempts,
            };
          }
        }

        throw new AIProviderError(
          eval1.isValid ? `Model generated edited code that failed UI quality checks (Score: ${eval1.score})` : "Model generated edited code that failed validation checks",
          providerName,
          modelName,
          eval1.isValid ? "low_quality_ui" : "invalid_code"
        );
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorType = error instanceof AIProviderError ? error.errorType : "unknown";

        console.warn(
          `[AI Orchestrator] Provider edit attempt failed: ${providerName} / ${modelName}. ErrorType: ${errorType}. Error: ${error.message}`
        );

        providerAttempts.push({
          provider: providerName,
          model: modelName,
          success: false,
          errorType,
          errorMessage: process.env.NODE_ENV === "development" ? error.message : undefined,
          durationMs: duration,
        });
      }
    }
  }

  if (providerConfig === "mock" || allowMockFallback) {
    console.warn("[AI Orchestrator] All real models failed during edit. Falling back to Mock.");
    const startTime = Date.now();
    const mockResult = await new MockProvider().editWebsite(input);
    const duration = Date.now() - startTime;
    providerAttempts.push({
      provider: "mock",
      model: "mock-safe-fallback",
      success: true,
      durationMs: duration,
    });
    return {
      generatedCode: mockResult.generatedCode,
      provider: "mock",
      model: "mock-safe-fallback",
      isFallback: true,
      providerAttempts,
    };
  }

  const err = new Error("All AI providers failed during edit and fallback is disabled.") as any;
  err.status = 502;
  err.providerAttempts = providerAttempts;
  throw err;
}
