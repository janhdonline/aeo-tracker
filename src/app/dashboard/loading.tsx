import { LogoLoader } from '@/components/LogoLoader';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <LogoLoader variant="section" text="Loading AEO Dashboard..." subtext="Syncing visibility snapshots, prompt coverage, and source intelligence" />
    </div>
  );
}
