import { AppShell } from "@/components/app/AppShell";

export default function SettingsPage() {
  return (
    <AppShell>
      <h2 className="text-5xl font-black text-slate-950 dark:text-white">
        Settings
      </h2>
      <p className="mt-4 text-slate-600 dark:text-white/60">
        Manage your profile, theme, billing, and workspace preferences.
      </p>
    </AppShell>
  );
}
