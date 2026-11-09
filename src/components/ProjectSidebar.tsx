"use client";

import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Globe,
  ListChecks,
  Compass,
  ShieldAlert,
  Bot,
  FileCode2,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  key: string;
  badge?: string;
}

interface ProjectSidebarProps {
  projectId: string;
  domain: string;
  current?:
    | 'overview'
    | 'keywords'
    | 'sources'
    | 'briefs'
    | 'facts'
    | 'alerts'
    | 'analytics'
    | 'runs'
    | 'report'
    | 'llms'
    | 'settings';
}

export function ProjectSidebar({ projectId, domain, current = 'overview' }: ProjectSidebarProps) {
  const coreItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, href: `/dashboard/projects/${projectId}`, key: 'overview' },
    { label: 'Keywords', icon: FileText, href: `/dashboard/projects/${projectId}/keywords`, key: 'keywords' },
    {
      label: 'Citation Sources',
      icon: Compass,
      href: `/dashboard/projects/${projectId}/sources`,
      key: 'sources',
      badge: 'PRO',
    },
    { label: 'Recommendations', icon: BarChart3, href: `/dashboard/projects/${projectId}/briefs`, key: 'briefs' },
  ];

  const intelligenceItems: NavItem[] = [
    { label: 'Fact Watchdog', icon: ShieldAlert, href: `/dashboard/projects/${projectId}/facts`, key: 'facts' },
    { label: 'AI Crawlers', icon: Bot, href: `/dashboard/projects/${projectId}/analytics`, key: 'analytics' },
    { label: 'Scan History', icon: ListChecks, href: `/dashboard/projects/${projectId}/runs`, key: 'runs' },
    { label: 'Public Report', icon: Globe, href: `/report/${domain}`, key: 'report' },
  ];

  const workspaceItems: NavItem[] = [
    {
      label: 'llms.txt Engine',
      icon: FileCode2,
      href: `/dashboard/projects/${projectId}/llms`,
      key: 'llms',
      badge: 'AEO',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: `/dashboard/projects/${projectId}/settings`,
      key: 'settings',
    },
  ];

  const allItems: NavItem[] = [...coreItems, ...intelligenceItems, ...workspaceItems];

  return (
    <>
      {/* Mobile Horizontal Tab Navigation (Visible on phones/tablets < lg) */}
      <div className="block lg:hidden w-full overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 min-w-max p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      isActive
                        ? 'bg-slate-800 text-emerald-300'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Sidebar (Visible on screens >= lg) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 flex flex-col gap-3">
          {/* Domain Pill Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">{domain}</span>
          </div>

          <nav className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Monitoring
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {coreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = current === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            isActive
                              ? 'bg-slate-800 text-emerald-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Intelligence & Audit
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {intelligenceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = current === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspace & Delivery
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {workspaceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = current === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            isActive
                              ? 'bg-slate-800 text-blue-300'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
