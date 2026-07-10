"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import VisualBuilder from "@/components/builder/VisualBuilder";

export default function ProjectBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const { setProjectId, setBuilderData, setSaving } = useBuilderStore();

  useEffect(() => {
    async function loadBuilder() {
      try {
        setProjectId(projectId);
        
        // Use a real API endpoint here if we had one running, but for the task we can hit the mock API or just fetch
        const res = await fetch(`/api/projects/${projectId}/builder`);
        
        if (res.ok) {
          const data = await res.json();
          if (!data.builderEnabled) {
            // Need to initialize
            const initRes = await fetch(`/api/projects/${projectId}/builder/initialize`, { method: 'POST' });
            if (initRes.ok) {
              const initData = await initRes.json();
              setBuilderData(initData.builderData);
            }
          } else {
            setBuilderData(data.builderData);
          }
        }
      } catch (err) {
        console.error("Failed to load builder", err);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadBuilder();
    }
  }, [projectId, setProjectId, setBuilderData]);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white">Loading Builder...</div>;
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden flex flex-col text-zinc-100">
      <VisualBuilder />
    </div>
  );
}
