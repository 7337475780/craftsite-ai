"use client";

import { LivePreview } from "@/components/generate/LivePreview";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UpgradeComingSoonModal } from "@/components/billing/UpgradeComingSoonModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Monitor,
  MonitorSmartphone,
  Palette,
  Wand2,
  Cpu,
  Copy,
  CheckCheck,
  Zap,
  Save,
  FolderOpen,
  Trash2,
  AlertTriangle,
  Download,
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  X,
  Clock,
  Globe,
  Share2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { exportProjectAsZip } from "@/lib/export-project";
import {
  getProjectById,
  updateProject,
  deleteProject,
  generateProjectTitle,
} from "@/lib/projects-storage";
import type { AIProviderName, ProjectVersion, SavedProject } from "@/types/project";
import { trackClientEvent } from "@/lib/analytics-client";

type GenerateResponse = {
  success: boolean;
  message: string;
  data?: {
    prompt: string;
    style: string;
    websiteType: string;
    generatedCode: string;
    provider: AIProviderName;
    isFallback: boolean;
  };
};

const STEPS = [
  "Analyzing your prompt...",
  "Designing the layout...",
  "Writing React components...",
  "Polishing styles...",
  "Spinning up the preview...",
];

const EDIT_STEPS = [
  "Reading your instruction...",
  "Analyzing current code...",
  "Applying changes...",
  "Validating output...",
  "Finishing up...",
];

const QUICK_EDIT_CHIPS = [
  "Make it more premium",
  "Improve mobile layout",
  "Add stronger CTA",
  "Make colors more futuristic",
  "Add testimonials section",
  "Simplify the design",
];

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const id = params?.projectId as string;
  const { user, refetchMe } = useAuth();

  const [project, setProject] = useState<SavedProject | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [websiteType, setWebsiteType] = useState("responsive");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [providerInfo, setProviderInfo] = useState<{
    provider: AIProviderName;
    isFallback: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ── AI Edit Mode State ────────────────────────────────────────────────────
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoadingStep, setEditLoadingStep] = useState(0);
  const [editPanelOpen, setEditPanelOpen] = useState(true);

  // ── Version History State ─────────────────────────────────────────────────
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Publish / Share State ─────────────────────────────────────────────────
  const [isPublished, setIsPublished] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [publishPanelOpen, setPublishPanelOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = useCallback(async () => {
    if (!generatedCode) return;
    setIsExporting(true);
    setError("");
    try {
      const title = project?.title || generateProjectTitle(prompt) || "CraftSite Export";
      await exportProjectAsZip({
        title,
        prompt,
        generatedCode,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [generatedCode, prompt, project]);

  // Load project from API on mount
  useEffect(() => {
    if (!id || !user) return;
    async function load() {
      try {
        const result = await apiGet(`/api/workspaces/${workspaceId}/projects/${id}`);
        if (result && !result.error && !result.success) {
           // It might just return the project directly in workspace endpoints
           const found = result;
           setProject(found);
           setPrompt(found.prompt);
           setGeneratedCode(found.generatedCode);
           setProviderInfo({
             provider: found.provider,
             isFallback: found.isFallback,
           });
           setIsPublished(found.isPublished ?? false);
           setShareSlug(found.shareSlug ?? null);
           setIsSaved(true);
           trackClientEvent("workspace_project_opened", { projectId: found.id, workspaceId });
        } else if (result.success) {
          const found = result.data;
          setProject(found);
          setPrompt(found.prompt);
          setGeneratedCode(found.generatedCode);
          setProviderInfo({
            provider: found.provider,
            isFallback: found.isFallback,
          });
          setIsPublished(found.isPublished ?? false);
          setShareSlug(found.shareSlug ?? null);
          setIsSaved(true);
          trackClientEvent("project_opened", { projectId: found.id });
        } else {
          const local = getProjectById(id);
          if (local) {
            setProject(local);
            setPrompt(local.prompt);
            setGeneratedCode(local.generatedCode);
            setProviderInfo({
              provider: local.provider,
              isFallback: local.isFallback,
            });
            setIsSaved(true);
            trackClientEvent("project_opened", { projectId: local.id, localOnly: true });
          } else {
            setIsNotFound(true);
          }
        }
      } catch (err) {
        console.warn("Cloud project load failed, falling back to localStorage", err);
        const local = getProjectById(id);
        if (local) {
          setProject(local);
          setPrompt(local.prompt);
          setGeneratedCode(local.generatedCode);
          setProviderInfo({
            provider: local.provider,
            isFallback: local.isFallback,
          });
          setIsPublished(local.isPublished ?? false);
          setShareSlug(local.shareSlug ?? null);
          setIsSaved(true);
        } else {
          setIsNotFound(true);
        }
      }
    }
    load();
  }, [id, user]);

  // Load versions when panel is opened
  // ── Publish Handler ─────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!id) return;
    trackClientEvent("publish_clicked", { projectId: id });
    setIsPublishing(true);
    setPublishError("");
    try {
      const result = await apiPost(`/api/workspaces/${workspaceId}/projects/${id}/publish`);
      if (!result.success) throw new Error(result.message || "Publish failed.");
      const updated = result.data;
      setIsPublished(true);
      setShareSlug(updated.shareSlug);
      setProject((prev) => prev ? { ...prev, isPublished: true, shareSlug: updated.shareSlug, publishedAt: updated.publishedAt } : null);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setIsPublishing(false);
    }
  }, [id]);

  // ── Unpublish Handler ────────────────────────────────────────────────────
  const handleUnpublish = useCallback(async () => {
    if (!id) return;
    trackClientEvent("unpublish_clicked", { projectId: id });
    setIsUnpublishing(true);
    setPublishError("");
    try {
      const result = await apiPost(`/api/workspaces/${workspaceId}/projects/${id}/unpublish`);
      if (!result.success) throw new Error(result.message || "Unpublish failed.");
      setIsPublished(false);
      setShareSlug(null);
      setProject((prev) => prev ? { ...prev, isPublished: false, shareSlug: null, publishedAt: null } : null);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Unpublish failed.");
    } finally {
      setIsUnpublishing(false);
    }
  }, [id]);

  // ── Copy Share Link ──────────────────────────────────────────────────────
  const handleCopyShareLink = useCallback(async () => {
    if (!shareSlug) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${appUrl}/share/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [shareSlug]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = shareSlug ? `${appUrl}/share/${shareSlug}` : null;

  const loadVersions = useCallback(async () => {
    if (!id) return;
    setVersionsLoading(true);
    try {
      const result = await apiGet(`/api/workspaces/${workspaceId}/projects/${id}/versions`);
      if (result.success) {
        setVersions(result.data || []);
      }
    } catch (err) {
      console.warn("Failed to load versions", err);
    } finally {
      setVersionsLoading(false);
    }
  }, [id]);

  const handleToggleVersions = useCallback(async () => {
    const opening = !versionsOpen;
    setVersionsOpen(opening);
    if (opening) {
      await loadVersions();
    }
  }, [versionsOpen, loadVersions]);

  const isCompact = generatedCode.length > 0 || isGenerating;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleSave = useCallback(async () => {
    if (!id || !generatedCode || !providerInfo) return;
    setIsSaving(true);
    setError("");
    const title = generateProjectTitle(prompt);

    try {
      const result = await apiPatch(`/api/workspaces/${workspaceId}/projects/${id}`, {
        title,
        prompt,
        generatedCode,
        provider: providerInfo.provider,
        isFallback: providerInfo.isFallback,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update project on cloud.");
      }

      setIsSaved(true);
      setSaveSuccess(true);
      setProject(result.data);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Cloud save failed, falling back to localStorage", err);
      const success = updateProject(id, {
        title,
        prompt,
        generatedCode,
        provider: providerInfo.provider,
        isFallback: providerInfo.isFallback,
        style,
        websiteType,
      });

      if (success) {
        setIsSaved(true);
        setSaveSuccess(true);
        setProject((prev) =>
          prev
            ? {
                ...prev,
                title,
                prompt,
                generatedCode,
                provider: providerInfo.provider,
                isFallback: providerInfo.isFallback,
                style,
                websiteType,
                updatedAt: new Date().toISOString(),
              }
            : null,
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError("Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [id, generatedCode, prompt, providerInfo, style, websiteType]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      const result = await apiDelete(`/api/workspaces/${workspaceId}/projects/${id}`);
      if (result && result.error) {
        throw new Error(result.error || "Failed to delete project");
      }
      setTimeout(() => {
        router.push(`/workspaces/${workspaceId}/projects`);
      }, 500);
    } catch (err) {
      console.warn("Cloud delete failed, attempting local delete", err);
      deleteProject(id);
      setTimeout(() => {
        router.push("/projects");
      }, 500);
    }
  }, [id, router]);

  const handleGenerate = async () => {
    try {
      setError("");
      setProviderInfo(null);
      setLoadingStep(0);
      setIsSaved(false);

      if (prompt.trim().length < 10) {
        setError("Please enter at least 10 characters.");
        return;
      }

      setIsGenerating(true);

      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      }, 1400);

      const result = (await apiPost("/api/generate", { prompt, style, websiteType })) as GenerateResponse;

      clearInterval(stepInterval);

      if (!result.success) {
        throw new Error(result.message || "Failed to generate website.");
      }

      setGeneratedCode(result.data?.generatedCode || "");
      if (result.data) {
        setProviderInfo({
          provider: result.data.provider,
          isFallback: result.data.isFallback,
        });
      }
      setViewMode("preview");
      refetchMe();
    } catch (err: any) {
      if (err.message?.includes("credits") || err.status === 402) {
        setShowUpgradeModal(true);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while generating.",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ── AI Edit Handler ────────────────────────────────────────────────────────
  const handleEdit = useCallback(async () => {
    if (!id || !generatedCode) return;
    if (editInstruction.trim().length < 5) {
      setEditError("Please enter at least 5 characters.");
      return;
    }

    setEditError("");
    setEditSuccess(false);
    setIsEditing(true);
    setEditLoadingStep(0);
    trackClientEvent("ai_edit_clicked", { projectId: id });

    const stepInterval = setInterval(() => {
      setEditLoadingStep((prev) => Math.min(prev + 1, EDIT_STEPS.length - 1));
    }, 1000);

    try {
      const result = await apiPost(`/api/workspaces/${workspaceId}/projects/${id}/edit`, {
        editInstruction: editInstruction.trim(),
      });

      clearInterval(stepInterval);

      if (!result.success) {
        throw new Error(result.message || "Edit failed.");
      }

      const { project: updatedProject, provider, isFallback } = result.data;
      setGeneratedCode(updatedProject.generatedCode);
      setProviderInfo({ provider, isFallback });
      setProject(updatedProject);
      setEditInstruction("");
      setEditSuccess(true);
      setIsSaved(true);
      setTimeout(() => setEditSuccess(false), 4000);

      // Refresh version list if open
      if (versionsOpen) {
        await loadVersions();
      }

      setViewMode("preview");
      refetchMe();
    } catch (err: any) {
      clearInterval(stepInterval);
      if (err.message?.includes("credits") || err.status === 402) {
        setShowUpgradeModal(true);
      } else {
        setEditError(
          err instanceof Error ? err.message : "Something went wrong while editing.",
        );
      }
    } finally {
      setIsEditing(false);
    }
  }, [id, generatedCode, editInstruction, versionsOpen, loadVersions]);

  // ── Version Restore Handler ───────────────────────────────────────────────
  const handleRestore = useCallback(async (versionId: string) => {
    if (!id) return;
    trackClientEvent("version_restore_clicked", { projectId: id, versionId });
    setRestoringVersionId(versionId);
    try {
      const result = await apiPost(`/api/workspaces/${workspaceId}/projects/${id}/versions/${versionId}/restore`);
      if (!result.success) {
        throw new Error(result.message || "Restore failed.");
      }
      const updatedProject = result.data;
      setGeneratedCode(updatedProject.generatedCode);
      setProject(updatedProject);
      setIsSaved(true);
      setViewMode("preview");
      await loadVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setRestoringVersionId(null);
    }
  }, [id, loadVersions]);

  // ── Version Delete Handler ────────────────────────────────────────────────
  const handleDeleteVersion = useCallback(async (versionId: string) => {
    if (!id) return;
    setDeletingVersionId(versionId);
    try {
      const result = await apiDelete(`/api/workspaces/${workspaceId}/projects/${id}/versions/${versionId}`);
      if (!result.success) {
        throw new Error(result.message || "Delete version failed.");
      }
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete version failed.");
    } finally {
      setDeletingVersionId(null);
    }
  }, [id]);

  const providerLabel =
    providerInfo?.provider === "openrouter"
      ? "OpenRouter"
      : providerInfo?.provider === "gemini"
        ? "Gemini Flash"
        : "Safe Fallback";

  if (isNotFound) {
    return (
      <main className="flex h-screen flex-col items-center justify-center craftsite-bg p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04] mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Project Not Found
        </h1>
        <p className="text-slate-500 dark:text-white/50 mb-6 max-w-sm">
          The project you are trying to view does not exist or has been deleted.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
        >
          <FolderOpen size={14} />
          Back to Projects
        </Link>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex h-screen flex-col items-center justify-center craftsite-bg">
        <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="flex h-[100dvh] flex-col overflow-hidden craftsite-bg">
        {/* ── Premium Workspace Navbar ── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="workspace-navbar relative flex-none px-4 py-3 z-50"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent dark:via-white/8" />

          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-5">
              <Link
                href={`/workspaces/${workspaceId}/projects`}
                className="group flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-violet-400/60 hover:bg-white hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                Projects
              </Link>
              <div className="h-5 w-px bg-gradient-to-b from-transparent via-black/15 to-transparent dark:via-white/15" />
              <CraftSiteLogo />
            </div>

            {/* Center breadcrumb */}
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2 rounded-full border border-black/8 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/40">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Workspace
              </div>
              <span className="text-xs text-slate-400 dark:text-white/25">/</span>
              <span className="max-w-[200px] truncate rounded-full border border-violet-400/20 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                {project.title}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">


              {/* Save Project button */}
              <AnimatePresence>
                {generatedCode && !isGenerating && !isEditing && (
                  <motion.button
                    key="save"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={handleSave}
                    disabled={isSaved || isSaving}
                    className={`hidden items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all sm:flex cursor-pointer ${
                      saveSuccess
                        ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : isSaved
                          ? "border-black/10 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/30"
                          : "border-violet-400/30 bg-violet-50 text-violet-700 hover:border-violet-500/40 hover:bg-violet-100 hover:shadow-sm dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCheck size={12} className="text-emerald-500" />
                        Saved!
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-violet-600 dark:text-cyan-400" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Save size={12} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={12} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-red-400 dark:hover:bg-red-500/10 sm:flex cursor-pointer"
              >
                <Trash2 size={12} />
                Delete
              </button>

              {/* Copy code button */}
              <AnimatePresence>
                {generatedCode && !isGenerating && !isEditing && (
                  <motion.button
                    key="copy"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.25 }}
                    onClick={handleCopy}
                    className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-violet-400/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/10 sm:flex cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCheck size={12} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy Code
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Export ZIP button */}
              <AnimatePresence>
                {generatedCode && !isGenerating && !isEditing && (
                  <motion.button
                    key="export"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.25 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-violet-400/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/10 sm:flex cursor-pointer disabled:opacity-50"
                  >
                    {exportSuccess ? (
                      <>
                        <CheckCheck size={12} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Exported!</span>
                      </>
                    ) : isExporting ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-violet-600 dark:text-cyan-400" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        Export ZIP
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <UpgradeComingSoonModal onClose={() => setShowUpgradeModal(false)} />
          )}
        </AnimatePresence>

        {/* ── Main Workspace Body ── */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:p-5">
          {/* Left Command Panel */}
          <motion.div
            layout
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`flex flex-col gap-4 overflow-y-auto min-h-0 lg:h-full transition-all duration-500 ${
              isCompact
                ? "lg:w-[340px] xl:w-[400px]"
                : "mx-auto w-full max-w-2xl justify-center lg:w-[600px]"
            }`}
            style={{ scrollbarWidth: "none" }}
          >
            {/* Panel header */}
            <motion.div layout className="flex flex-col gap-1.5">
              <motion.h1
                layout
                className={`font-black tracking-tight text-slate-900 dark:text-white transition-all duration-300 ${
                  isCompact ? "text-xl" : "text-3xl"
                }`}
              >
                Modify Project
              </motion.h1>
              <motion.p layout className="text-sm text-slate-500 dark:text-white/50">
                Refine your prompt or use AI Edit Mode below.
              </motion.p>
            </motion.div>

            {/* Prompt Card */}
            <motion.div
              layout
              className={`flex flex-col flex-none rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.1)] backdrop-blur-3xl transition-shadow duration-300 hover:shadow-[0_12px_50px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_60px_rgba(0,0,0,0.4)] ${
                !isCompact ? "glow-border" : ""
              }`}
            >
              <div className="relative rounded-[1.5rem] p-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.5rem] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
                {/* Status banners */}
                <AnimatePresence mode="popLayout">
                  {saveSuccess && (
                    <motion.div
                      key="save-success"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCheck size={12} />
                        Project updated!
                      </span>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      key="error-banner"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden rounded-xl border border-red-400/25 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Textarea */}
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="Refine your prompt..."
                  className={`w-full resize-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-300 dark:text-white dark:placeholder:text-white/30 ${
                    isCompact ? "min-h-[90px] text-sm" : "min-h-[130px] text-lg"
                  }`}
                  disabled={isGenerating || isEditing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                />

                {/* Controls row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4 dark:border-white/6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setStyle(style === "modern" ? "premium" : "modern");
                        setIsSaved(false);
                      }}
                      disabled={isGenerating || isEditing}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        style === "modern"
                          ? "border-violet-500/60 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300"
                          : "border-black/10 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                      }`}
                    >
                      <Palette size={11} />
                      {style === "modern" ? "Modern" : "Premium"}
                    </button>

                    <button
                      onClick={() => {
                        setWebsiteType(websiteType === "responsive" ? "saas" : "responsive");
                        setIsSaved(false);
                      }}
                      disabled={isGenerating || isEditing}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        websiteType === "responsive"
                          ? "border-violet-500/60 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300"
                          : "border-black/10 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                      }`}
                    >
                      <MonitorSmartphone size={11} />
                      {websiteType === "responsive" ? "Responsive" : "SaaS"}
                    </button>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || isEditing || prompt.trim().length < 5 || (user?.credits === 0)}
                    title={user?.credits === 0 ? "No credits remaining" : ""}
                    className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl disabled:hover:scale-100 cursor-pointer ${
                      isGenerating
                        ? "cursor-wait bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 opacity-80 shadow-[0_0_25px_rgba(124,58,237,0.4)]"
                        : "bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_35px_rgba(124,58,237,0.55)] disabled:opacity-50"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isGenerating ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          Regenerate
                          <span className="hidden opacity-60 sm:inline">⌘↵</span>
                          <span className="flex items-center gap-0.5 rounded border border-white/20 bg-black/20 px-1 py-0.5 text-[9px] font-bold">
                            <Zap size={9} />1
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Publish / Share Panel ── */}
            <AnimatePresence>
              {isCompact && !isGenerating && (
                <motion.div
                  layout
                  key="publish-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col flex-none rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] overflow-hidden"
                >
                  <button
                    onClick={() => setPublishPanelOpen((o) => !o)}
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl shadow-md ${
                        isPublished 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/20" 
                          : "bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 shadow-black/5"
                      }`}>
                        {isPublished ? (
                          <Globe size={13} className="text-white" />
                        ) : (
                          <Share2 size={13} className="text-slate-500 dark:text-white/50" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Share Project</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/35">
                          {isPublished ? "Published to web" : "Make publicly accessible"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPublished && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCheck size={10} />
                          Live
                        </span>
                      )}
                      <ChevronDown size={14} className={`text-slate-400 dark:text-white/30 transition-transform duration-200 ${publishPanelOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                    {publishPanelOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-black/6 dark:border-white/6">
                          {publishError && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-red-400/25 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
                              {publishError}
                            </div>
                          )}

                          {!isPublished ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-xs text-slate-500 dark:text-white/50">
                                Publishing will create a unique public link so anyone can view your generated website.
                              </p>
                              <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-violet-500/25 hover:shadow-md disabled:opacity-50"
                              >
                                {isPublishing ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Publishing...
                                  </>
                                ) : (
                                  <>
                                    <Globe size={13} />
                                    Publish Website
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 mt-2">
                              {/* Public Link Box */}
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
                                  Public Share Link
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 overflow-hidden rounded-xl border border-black/10 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
                                    <span className="truncate block">{shareUrl}</span>
                                  </div>
                                  <button
                                    onClick={handleCopyShareLink}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.08]"
                                    title="Copy link"
                                  >
                                    {linkCopied ? (
                                      <CheckCheck size={14} className="text-emerald-500" />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                  <a
                                    href={shareUrl || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.08]"
                                    title="Open link"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>
                              
                              {/* Unpublish */}
                              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 dark:text-white/40">
                                  Visible to anyone with the link
                                </span>
                                <button
                                  onClick={handleUnpublish}
                                  disabled={isUnpublishing}
                                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                                >
                                  {isUnpublishing ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <EyeOff size={12} />
                                  )}
                                  Unpublish
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── AI Edit Mode Panel ── */}
            <AnimatePresence>
              {isCompact && !isGenerating && (
                <motion.div
                  layout
                  key="edit-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="flex flex-col flex-none rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] overflow-hidden"
                >
                  {/* Edit panel header */}
                  <button
                    onClick={() => setEditPanelOpen((o) => !o)}
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-md shadow-violet-500/20">
                        <Sparkles size={13} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">AI Edit Mode</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/35">
                          Describe a change to apply
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editSuccess && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCheck size={10} />
                          Applied!
                        </span>
                      )}
                      <ChevronDown size={14} className={`text-slate-400 dark:text-white/30 transition-transform duration-200 ${editPanelOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                    {editPanelOpen && (
                        <div className="px-5 pb-4 border-t border-black/6 dark:border-white/6">
                          {/* Edit error */}
                          <AnimatePresence>
                            {editError && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden rounded-xl border border-red-400/25 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                              >
                                {editError}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Quick chips */}
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {QUICK_EDIT_CHIPS.map((chip) => (
                              <button
                                key={chip}
                                onClick={() => {
                                  setEditInstruction(chip);
                                  editTextareaRef.current?.focus();
                                }}
                                disabled={isEditing}
                                className="rounded-full border border-black/10 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-all hover:border-violet-400/50 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 cursor-pointer disabled:opacity-40"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>

                          {/* Edit textarea */}
                          <div className="relative mt-3">
                            <textarea
                              ref={editTextareaRef}
                              value={editInstruction}
                              onChange={(e) => {
                                setEditInstruction(e.target.value);
                                setEditError("");
                              }}
                              placeholder="e.g. Make the hero more futuristic..."
                              disabled={isEditing}
                              rows={3}
                              className="w-full resize-none rounded-2xl border border-black/10 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all focus:border-violet-400/50 focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-violet-400/30 dark:focus:bg-white/[0.07]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                  handleEdit();
                                }
                              }}
                            />
                          </div>

                          {/* Edit loading status */}
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 overflow-hidden"
                              >
                                <div className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-50 px-3.5 py-2.5 text-xs font-semibold text-violet-700 dark:border-violet-400/15 dark:bg-violet-500/10 dark:text-violet-300">
                                  <Loader2 size={12} className="animate-spin shrink-0" />
                                  <motion.span
                                    key={editLoadingStep}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                  >
                                    {EDIT_STEPS[editLoadingStep]}
                                  </motion.span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Apply Edit button */}
                          <button
                            onClick={handleEdit}
                            disabled={isEditing || editInstruction.trim().length < 5 || (user?.credits === 0)}
                            title={user?.credits === 0 ? "No credits remaining" : ""}
                            className="mt-3 group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-violet-500/30 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {isEditing ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Editing website...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} />
                                  Apply AI Edit
                                  <span className="opacity-60 text-xs">⌘↵</span>
                                  <span className="ml-1 flex items-center gap-0.5 rounded border border-white/20 bg-black/20 px-1 py-0.5 text-[9px] font-bold">
                                    <Zap size={9} />1
                                  </span>
                                </>
                              )}
                            </span>
                          </button>
                        </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Version History Panel ── */}
            <AnimatePresence>
              {isCompact && !isGenerating && (
                <motion.div
                  layout
                  key="version-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col flex-none rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] overflow-hidden"
                >
                  {/* Version panel header */}
                  <button
                    onClick={handleToggleVersions}
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-md dark:from-slate-500 dark:to-slate-700">
                        <History size={13} className="text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Version History</p>
                          {versions.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-white/50">
                              {versions.length}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-white/35">
                          Browse and restore previous states
                        </p>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 dark:text-white/30 transition-transform duration-200 ${versionsOpen ? "rotate-180" : ""}`} />
                  </button>

                    {versionsOpen && (
                        <div className="border-t border-black/6 dark:border-white/6">
                          {versionsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400 dark:text-white/30">
                              <Loader2 size={14} className="animate-spin" />
                              Loading versions...
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                              <Clock size={20} className="text-slate-300 dark:text-white/20" />
                              <p className="text-xs text-slate-400 dark:text-white/30">
                                No versions yet.<br />
                                Edit your project to create a version.
                              </p>
                            </div>
                          ) : (
                            <div className="max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                              {versions.map((version, idx) => (
                                <div
                                  key={version.id}
                                  className={`group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03] ${
                                    idx !== versions.length - 1
                                      ? "border-b border-black/5 dark:border-white/5"
                                      : ""
                                  }`}
                                >
                                  {/* Version number badge */}
                                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-white/10 dark:text-white/60">
                                    v{version.versionNumber}
                                  </div>

                                  {/* Version info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-slate-700 dark:text-white/80">
                                        {version.title || `Version ${version.versionNumber}`}
                                      </span>
                                      <span className="shrink-0 text-[10px] text-slate-400 dark:text-white/25">
                                        {formatRelativeDate(version.createdAt)}
                                      </span>
                                    </div>
                                    {version.editPrompt && (
                                      <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-white/30">
                                        {version.editPrompt}
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex shrink-0 items-center gap-1.5">
                                    <button
                                      onClick={() => handleRestore(version.id)}
                                      disabled={restoringVersionId === version.id}
                                      title="Restore this version"
                                      className="flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition-all hover:border-violet-400/50 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 cursor-pointer disabled:opacity-40"
                                    >
                                      {restoringVersionId === version.id ? (
                                        <Loader2 size={10} className="animate-spin" />
                                      ) : (
                                        <RotateCcw size={10} />
                                      )}
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVersion(version.id)}
                                      disabled={deletingVersionId === version.id}
                                      title="Delete version"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-400 shadow-sm transition-all hover:border-red-400/50 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/30 dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer disabled:opacity-40 opacity-0 group-hover:opacity-100"
                                    >
                                      {deletingVersionId === version.id ? (
                                        <Loader2 size={10} className="animate-spin" />
                                      ) : (
                                        <X size={10} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save & Delete (Mobile Only) */}
            <AnimatePresence>
              {isCompact && generatedCode && !isGenerating && !isEditing && (
                <div className="flex flex-col gap-2 sm:hidden">
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    onClick={handleSave}
                    disabled={isSaved || isSaving}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                      isSaved
                        ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-violet-400/30 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300"
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCheck size={14} />
                        Saved!
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <CheckCheck size={14} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Changes
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete Project
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right Canvas Area ── */}
          <AnimatePresence mode="popLayout">
            {isCompact && (
              <motion.div
                layout
                key="canvas"
                initial={{ opacity: 0, x: 40, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-0 flex-1 flex-col rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)]"
              >
                {/* Canvas navbar */}
                <div className="flex flex-none items-center justify-between border-b border-black/6 px-5 py-3 dark:border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="animate-glow-pulse flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md">
                      <Monitor size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
                        Live Canvas
                      </p>
                      <p className={`text-[10px] font-medium transition-colors duration-300 ${
                        isGenerating || isEditing
                          ? "text-violet-600 dark:text-cyan-400"
                          : "text-slate-400 dark:text-white/35"
                      }`}>
                        {isEditing ? "Applying edit…" : isGenerating ? "Building…" : "Output ready"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Preview / Code tabs */}
                    <div className="flex rounded-full border border-black/10 bg-slate-100 p-1 dark:border-white/10 dark:bg-black/30">
                      {(["preview", "code"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`relative rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                            viewMode === mode
                              ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md dark:from-white dark:to-white dark:text-slate-950"
                              : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
                          }`}
                        >
                          {mode === "preview" ? (
                            <span className="flex items-center gap-1.5">
                              <Monitor size={11} />
                              Preview
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Code2 size={11} />
                              Code
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Copy when in code view */}
                    {viewMode === "code" && generatedCode && (
                      <button
                        onClick={handleCopy}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/80 text-slate-600 transition-all hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/10 cursor-pointer"
                      >
                        {copied ? (
                          <CheckCheck size={13} className="text-emerald-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Canvas content */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[1.75rem]">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950"
                      >
                        <div className="relative mb-10">
                          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20 blur-2xl" />
                          <div className="absolute -inset-4 animate-pulse rounded-full bg-cyan-400/10 blur-3xl" />
                          <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_60px_rgba(124,58,237,0.35)] backdrop-blur-xl">
                            <div className="animate-glow-pulse">
                              <Zap className="h-10 w-10 text-cyan-300" />
                            </div>
                          </div>
                        </div>

                        <motion.p
                          key={loadingStep}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="animate-shimmer mb-3 text-xl font-black tracking-tight"
                        >
                          {STEPS[loadingStep]}
                        </motion.p>

                        <div className="flex items-center gap-2">
                          {STEPS.map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                scale: i === loadingStep ? 1 : 0.7,
                                opacity: i === loadingStep ? 1 : i < loadingStep ? 0.5 : 0.25,
                              }}
                              className={`rounded-full ${
                                i === loadingStep
                                  ? "h-2.5 w-2.5 bg-cyan-400"
                                  : "h-2 w-2 bg-white/30"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-white/40">
                          Hang tight — crafting your fully responsive website from scratch.
                        </p>
                      </motion.div>
                    ) : isEditing ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950"
                      >
                        <div className="relative mb-10">
                          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20 blur-2xl" />
                          <div className="absolute -inset-4 animate-pulse rounded-full bg-blue-400/10 blur-3xl" />
                          <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_60px_rgba(124,58,237,0.35)] backdrop-blur-xl">
                            <div className="animate-glow-pulse">
                              <Sparkles className="h-10 w-10 text-violet-300" />
                            </div>
                          </div>
                        </div>

                        <motion.p
                          key={editLoadingStep}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="animate-shimmer mb-3 text-xl font-black tracking-tight"
                        >
                          {EDIT_STEPS[editLoadingStep]}
                        </motion.p>

                        <div className="flex items-center gap-2">
                          {EDIT_STEPS.map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                scale: i === editLoadingStep ? 1 : 0.7,
                                opacity: i === editLoadingStep ? 1 : i < editLoadingStep ? 0.5 : 0.25,
                              }}
                              className={`rounded-full ${
                                i === editLoadingStep
                                  ? "h-2.5 w-2.5 bg-violet-400"
                                  : "h-2 w-2 bg-white/30"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-white/40">
                          Applying your edit — preserving the original as a version.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="canvas-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                      >
                        <LivePreview code={generatedCode} viewMode={viewMode} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </ProtectedRoute>

    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="Delete Project"
      message="Are you sure you want to delete this project? This action cannot be undone."
      confirmText="Delete Project"
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteConfirm(false)}
    />
  </>
  );
}
