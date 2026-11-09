"use client";

import { motion } from 'framer-motion';
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
} from 'lucide-react';

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
    | 'report';
}

export function ProjectSidebar({ projectId, domain, current = 'overview' }: ProjectSidebarProps) {
  const coreItems = [
    { label: 'Overview', icon: LayoutDashboard, href: `/dashboard/projects/${projectId}`, key: 'overview' as const },
    { label: 'Keywords', icon: FileText, href: `/dashboard/projects/${projectId}/keywords`, key: 'keywords' as const },
    {
      label: 'Source Intelligence',
      icon: Compass,
      href: `/dashboard/projects/${projectId}/sources`,
      key: 'sources' as const,
      badge: 'PRO',
    },
    { label: 'Fix Briefs', icon: BarChart3, href: `/dashboard/projects/${projectId}/briefs`, key: 'briefs' as const },
  ];

  const intelligenceItems = [
    { label: 'Fact Watch', icon: ShieldAlert, href: `/dashboard/projects/${projectId}/facts`, key: 'facts' as const },
    { label: 'AI Crawlers', icon: Bot, href: `/dashboard/projects/${projectId}/analytics`, key: 'analytics' as const },
    { label: 'Runs History', icon: ListChecks, href: `/dashboard/projects/${projectId}/runs`, key: 'runs' as const },
    { label: 'Public Report', icon: Globe, href: `/report/${domain}`, key: 'report' as const },
  ];

  return (
    <aside className="w-64 shrink-0">
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
      </nav>
    </aside>
  );
}
