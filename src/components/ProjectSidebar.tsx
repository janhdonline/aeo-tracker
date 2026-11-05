import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutDashboard, FileText, BarChart3, Globe } from 'lucide-react';

interface ProjectSidebarProps {
  projectId: string;
  domain: string;
  current?: 'overview' | 'keywords' | 'briefs' | 'report';
}

export function ProjectSidebar({ projectId, domain, current = 'overview' }: ProjectSidebarProps) {
  const items = [
    { label: 'Overview', icon: LayoutDashboard, href: `/dashboard/projects/${projectId}`, key: 'overview' as const },
    { label: 'Keywords', icon: FileText, href: `/dashboard/projects/${projectId}/keywords`, key: 'keywords' as const },
    { label: 'Briefs', icon: BarChart3, href: `/dashboard/projects/${projectId}/briefs`, key: 'briefs' as const },
    { label: 'Report', icon: Globe, href: `/report/${domain}`, key: 'report' as const },
  ];

  return (
    <aside className="w-64 shrink-0">
      <nav className="sticky top-20 flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#eb9d2a]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-[#eb9d2a]/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-4 w-4 shrink-0 ${isActive ? 'text-[#eb9d2a]' : 'text-slate-400'}`} strokeWidth={2} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}