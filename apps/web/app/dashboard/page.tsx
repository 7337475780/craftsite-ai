import { AppShell } from "@/components/app/AppShell";
import { FolderOpen, Sparkles, Wand2, Rocket } from "lucide-react";

const stats = [
  { label: "Projects", value: "12", icon: FolderOpen },
  { label: "Generations", value: "48", icon: Sparkles },
  { label: "Templates Used", value: "9", icon: Wand2 },
  { label: "Published", value: "3", icon: Rocket },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-700 dark:text-cyan-300">
            Dashboard
          </p>
          <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-6xl">
            Your creative <span className="gradient-text">command center</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200">
                  <Icon size={22} />
                </div>
                <p className="text-4xl font-black text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-white/55">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.035]">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              Recent projects
            </h3>

            <div className="mt-6 space-y-4">
              {[
                "AI Resume SaaS",
                "Portfolio Website",
                "Restaurant Landing",
              ].map((project) => (
                <div
                  key={project}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">
                      {project}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-white/45">
                      Updated recently
                    </p>
                  </div>

                  <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-slate-950 p-6 text-white dark:border-white/10">
            <h3 className="text-xl font-black">AI activity</h3>
            <div className="mt-6 space-y-4">
              {[
                "Generated hero section",
                "Created pricing layout",
                "Exported React code",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
