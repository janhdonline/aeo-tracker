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
      label: 'Sources',
      icon: Compass,
      href: `/dashboard/projects/${projectId}/sources`,
      key: 'sources',
      badge: 'PRO',
    },
    { label: 'Fix Briefs', icon: BarChart3, href: `/dashboard/projects/${projectId}/briefs`, key: 'briefs' },
  ];

  const intelligenceItems: NavItem[] = [
    { label: 'Fact Watch', icon: ShieldAlert, href: `/dashboard/projects/${projectId}/facts`, key: 'facts' },
    { label: 'AI Crawlers', icon: Bot, href: `/dashboard/projects/${projectId}/analytics`, key: 'analytics' },
    { label: 'Runs', icon: ListChecks, href: `/dashboard/projects/${projectId}/runs`, key: 'runs' },
    { label: 'Report', icon: Globe, href: `/report/${domain}`, key: 'report' },
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
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                  strokeWidth={2}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
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
        <nav className="sticky top-20 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Monitoring
            </p>
            <div className="mt-1 flex flex-col gap-1">
              {coreItems.map((item) => {
                const Icon = item.icon;
                const isActive = current === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Intelligence & Audit
            </p>
            <div className="mt-1 flex flex-col gap-1">
              {intelligenceItems.map((item) => {
                const Icon = item.icon;
                const isActive = current === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace & Delivery
            </p>
            <div className="mt-1 flex flex-col gap-1">
              {workspaceItems.map((item) => {
                const Icon = item.icon;
                const isActive = current === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50/80 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        strokeWidth={2}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
