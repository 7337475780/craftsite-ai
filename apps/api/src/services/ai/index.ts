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
import { validateGeneratedCode, repairCommonCodeIssues } from "./code-utils.js";
import { MockProvider } from "./mock.provider.js";

export async function generateWebsiteWithAI(
  input: GenerateWebsiteInput & { aiMode?: AIMode; aiProvider?: AIProviderName | "auto" }
): Promise<GenerateWebsiteOutput> {
  const providerConfig = input.aiProvider || (process.env.AI_PROVIDER as AIProviderName | "auto") || "auto";
  const selectedMode = input.aiMode || (process.env.AI_MODE as AIMode) || "balanced";
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
      const startTime = Date.now();
      console.log(`[AI Orchestrator] Attempting provider: ${providerName}, model: ${modelName}`);

      try {
        const providerInstance = getProvider(providerName, modelName);
        const result = await providerInstance.generateWebsite(input);

        // Validate code
        if (validateGeneratedCode(result.generatedCode)) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
          });
          return {
            generatedCode: result.generatedCode,
            provider: providerName,
            model: modelName,
            isFallback: false,
            providerAttempts,
          };
        }

        console.warn(`[AI Orchestrator] Code failed initial validation. Trying local repair...`);
        const locallyRepaired = repairCommonCodeIssues(result.generatedCode);
        if (validateGeneratedCode(locallyRepaired)) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
          });
          return {
            generatedCode: locallyRepaired,
            provider: providerName,
            model: modelName,
            isFallback: false,
            providerAttempts,
          };
        }

        // Single-attempt provider repair
        if (providerInstance.repairWebsite) {
          console.warn(`[AI Orchestrator] Local repair failed. Prompting model for self-repair...`);
          const repairResult = await providerInstance.repairWebsite(result.generatedCode, false);

          if (validateGeneratedCode(repairResult.generatedCode)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
            });
            return {
              generatedCode: repairResult.generatedCode,
              provider: providerName,
              model: modelName,
              isFallback: false,
              providerAttempts,
            };
          }

          // Try local repair on provider repaired code
          const locallyRepairedRepair = repairCommonCodeIssues(repairResult.generatedCode);
          if (validateGeneratedCode(locallyRepairedRepair)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
            });
            return {
              generatedCode: locallyRepairedRepair,
              provider: providerName,
              model: modelName,
              isFallback: false,
              providerAttempts,
            };
          }
        }

        throw new AIProviderError(
          "Model generated code that failed validation checks",
          providerName,
          modelName,
          "invalid_code"
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
  const providerConfig = input.aiProvider || (process.env.AI_PROVIDER as AIProviderName | "auto") || "auto";
  const selectedMode = input.aiMode || (process.env.AI_MODE as AIMode) || "balanced";
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
      const startTime = Date.now();
      console.log(`[AI Orchestrator] Attempting edit provider: ${providerName}, model: ${modelName}`);

      try {
        const providerInstance = getProvider(providerName, modelName);
        const result = await providerInstance.editWebsite(input);

        // Validate code
        if (validateGeneratedCode(result.generatedCode)) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
          });
          return {
            generatedCode: result.generatedCode,
            provider: providerName,
            model: modelName,
            isFallback: false,
            providerAttempts,
          };
        }

        console.warn(`[AI Orchestrator] Edit code failed initial validation. Trying local repair...`);
        const locallyRepaired = repairCommonCodeIssues(result.generatedCode);
        if (validateGeneratedCode(locallyRepaired)) {
          const duration = Date.now() - startTime;
          providerAttempts.push({
            provider: providerName,
            model: modelName,
            success: true,
            durationMs: duration,
          });
          return {
            generatedCode: locallyRepaired,
            provider: providerName,
            model: modelName,
            isFallback: false,
            providerAttempts,
          };
        }

        // Single-attempt provider repair
        if (providerInstance.repairWebsite) {
          console.warn(`[AI Orchestrator] Edit local repair failed. Prompting model for self-repair...`);
          const repairResult = await providerInstance.repairWebsite(result.generatedCode, true);

          if (validateGeneratedCode(repairResult.generatedCode)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
            });
            return {
              generatedCode: repairResult.generatedCode,
              provider: providerName,
              model: modelName,
              isFallback: false,
              providerAttempts,
            };
          }

          const locallyRepairedRepair = repairCommonCodeIssues(repairResult.generatedCode);
          if (validateGeneratedCode(locallyRepairedRepair)) {
            const duration = Date.now() - startTime;
            providerAttempts.push({
              provider: providerName,
              model: modelName,
              success: true,
              durationMs: duration,
            });
            return {
              generatedCode: locallyRepairedRepair,
              provider: providerName,
              model: modelName,
              isFallback: false,
              providerAttempts,
            };
          }
        }

        throw new AIProviderError(
          "Model generated edited code that failed validation checks",
          providerName,
          modelName,
          "invalid_code"
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
