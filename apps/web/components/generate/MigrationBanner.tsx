"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSavedProjects, deleteProject } from "@/lib/projects-storage";
import { apiPost } from "@/lib/api-client";
import { Sparkles, Loader2, CheckCircle, Database } from "lucide-react";

export function MigrationBanner({ onMigrated }: { onMigrated: () => void }) {
  const { user } = useAuth();
  const [localCount, setLocalCount] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const local = getSavedProjects();
    setLocalCount(local.length);
  }, []);

  const handleMigrate = async () => {
    if (!user) return;
    setIsMigrating(true);
    const local = getSavedProjects();

    let successCount = 0;

    for (const project of local) {
      try {
        const res = await apiPost("/api/projects", {
          title: project.title,
          prompt: project.prompt,
          generatedCode: project.generatedCode,
          provider: project.provider,
          isFallback: project.isFallback,
        });

        if (res.success) {
          successCount++;
          // Delete locally
          deleteProject(project.id);
        }
      } catch (err) {
        console.error("Failed to migrate project:", project.title, err);
      }
    }

    setIsMigrating(false);
    if (successCount > 0) {
      setSuccess(true);
      setLocalCount(0);
      setTimeout(() => {
        setSuccess(false);
        onMigrated();
      }, 2500);
    }
  };

  if (localCount === 0 && !success) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-blue-500/5 to-cyan-500/10 p-5 shadow-sm backdrop-blur-md dark:border-violet-500/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-300">
            {success ? <CheckCircle size={20} /> : <Database size={20} />}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {success ? "Migration complete!" : "Local projects detected"}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/50">
              {success
                ? "Your local projects have been imported to your database account."
                : `You have ${localCount} local project${localCount !== 1 ? "s" : ""} saved on this device. Import them to your cloud account.`}
            </p>
          </div>
        </div>

        {!success && (
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isMigrating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Import Projects
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
