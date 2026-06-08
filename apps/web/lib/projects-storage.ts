import type { SavedProject } from "@/types/project";

const STORAGE_KEY = "craftsite_saved_projects";

/** Safe check: never run localStorage on the server */
function isClient(): boolean {
  return typeof window !== "undefined";
}

/** Read all saved projects. Returns [] on any failure. */
export function getSavedProjects(): SavedProject[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedProject[];
  } catch {
    return [];
  }
}

/** Persist the full list of projects. */
function persistProjects(projects: SavedProject[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // localStorage full or disabled — silently skip
  }
}

/** Save a new project (or overwrite one with the same id). */
export function saveProject(project: SavedProject): void {
  const existing = getSavedProjects();
  const idx = existing.findIndex((p) => p.id === project.id);
  if (idx !== -1) {
    existing[idx] = project;
  } else {
    // Newest first
    existing.unshift(project);
  }
  persistProjects(existing);
}

/** Delete a project by id. No-op if id doesn't exist. */
export function deleteProject(projectId: string): void {
  const existing = getSavedProjects();
  persistProjects(existing.filter((p) => p.id !== projectId));
}

/** Get a single project by id. Returns null if not found. */
export function getProjectById(projectId: string): SavedProject | null {
  const existing = getSavedProjects();
  return existing.find((p) => p.id === projectId) ?? null;
}

/** Partial-update a project. Returns false if not found. */
export function updateProject(
  projectId: string,
  updates: Partial<Omit<SavedProject, "id" | "createdAt">>,
): boolean {
  const existing = getSavedProjects();
  const idx = existing.findIndex((p) => p.id === projectId);
  if (idx === -1) return false;
  existing[idx] = {
    ...existing[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  persistProjects(existing);
  return true;
}

/** Generate a clean project title from a prompt (max 60 chars). */
export function generateProjectTitle(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 60) return cleaned;
  return cleaned.slice(0, 57).trimEnd() + "…";
}
