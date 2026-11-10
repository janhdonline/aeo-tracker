'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Globe,
  BarChart3,
  MessageSquare,
  Link2,
  Layers,
  TrendingUp,
  Package,
  Compass,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Check,
} from 'lucide-react';

export interface AppShellProject {
  id: string;
  domain: string;
  brand_name?: string;
}

export interface AppShellProps {
  user?: { email?: string; id?: string };
  userPlan?: string;
  projectId?: string;
  domain?: string;
  activeSection?:
    | 'dashboard'
    | 'reports'
    | 'prompts'
    | 'sources'
    | 'competitors'
    | 'traffic'
    | 'products'
    | 'presence'
    | 'brands'
    | 'tasks'
    | 'settings'
    | 'new';
  breadcrumbs?: Array<{ label: string; href?: string }>;
  projects?: AppShellProject[];
  children: React.ReactNode;
}

export function AppShell({
  user,
  userPlan,
  projectId,
  domain,
  activeSection = 'dashboard',
  breadcrumbs,
  projects: initialProjects,
  children,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  const [projectsList, setProjectsList] = useState<AppShellProject[]>(initialProjects || []);
  const [userProfile, setUserProfile] = useState<{ email?: string; plan?: string }>({
    email: user?.email,
    plan: userPlan
      ? userPlan === 'pro'
        ? 'Pro Plan'
        : userPlan === 'starter'
        ? 'Starter Plan'
        : userPlan
      : undefined,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const projectSelectorRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (projectSelectorRef.current && !projectSelectorRef.current.contains(e.target as Node)) {
        setProjectSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync userPlan prop
  useEffect(() => {
    if (userPlan) {
      setUserProfile((prev) => ({
        ...prev,
        plan:
          userPlan === 'pro'
            ? 'Pro Plan'
            : userPlan === 'starter'
            ? 'Starter Plan'
            : userPlan,
      }));
    }
  }, [userPlan]);

  // Fetch projects and profile if not supplied or to ensure fresh data
  useEffect(() => {
    async function fetchSessionAndData() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUserId = user?.id || session?.user?.id;
        const currentEmail = user?.email || session?.user?.email;

        if (currentEmail) {
          setUserProfile((prev) => ({ ...prev, email: currentEmail }));
        }

        if (currentUserId) {
          // Load profile for plan
          const { data: prof } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', currentUserId)
            .maybeSingle();

          if (prof?.plan) {
            setUserProfile((prev) => ({
              ...prev,
              plan:
                prof.plan === 'pro'
                  ? 'Pro Plan'
                  : prof.plan === 'starter'
                  ? 'Starter Plan'
                  : 'Free Tier',
            }));
          } else if (!userPlan) {
            setUserProfile((prev) => ({
              ...prev,
              plan: 'Free Tier',
            }));
          }

          // Load projects if not passed
          if (!initialProjects || initialProjects.length === 0) {
            const { data: projs } = await supabase
              .from('projects')
              .select('id, domain, brand_name')
              .eq('user_id', currentUserId)
              .order('created_at', { ascending: false });

            if (projs && projs.length > 0) {
              setProjectsList(projs);
            }
          }
        } else if (!userPlan) {
          setUserProfile((prev) => ({
            ...prev,
            plan: 'Free Tier',
          }));
        }
      } catch (err) {
        console.warn('AppShell session load err:', err);
      }
    }

    fetchSessionAndData();
  }, [user?.email, user?.id, userPlan, initialProjects]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Determine current active project and domain
  const activeProj =
    (projectId ? projectsList.find((p) => p.id === projectId) : null) ||
    projectsList[0] ||
    (domain ? { id: projectId || 'current', domain, brand_name: domain } : null);

  const currentProjectId = activeProj?.id;
  const currentDomain = domain || activeProj?.domain || 'revolut.com';

  // Navigation URLs dynamically bound to current active project
  const navLinks = [
    {
      key: 'reports',
      label: 'AEO Reports',
      href: `/report/${encodeURIComponent(currentDomain)}`,
      icon: FileText,
      isReport: true,
      active: pathname.startsWith('/report/'),
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}` : '/dashboard',
      icon: BarChart3,
      active: pathname === '/dashboard' || pathname === `/dashboard/projects/${currentProjectId}`,
    },
    {
      key: 'prompts',
      label: 'Prompts',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/keywords` : '/dashboard',
      icon: MessageSquare,
      active: pathname.includes('/keywords'),
    },
    {
      key: 'sources',
      label: 'Sources',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/sources` : '/dashboard',
      icon: Link2,
      active: pathname.includes('/sources'),
    },
    {
      key: 'competitors',
      label: 'Competitors',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/competitors` : '/dashboard',
      icon: Layers,
      active: pathname.includes('/competitors'),
    },
    {
      key: 'traffic',
      label: 'AI Traffic',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/analytics` : '/dashboard',
      icon: TrendingUp,
      active: pathname.includes('/analytics'),
    },
    {
      key: 'products',
      label: 'Products',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/facts` : '/dashboard',
      icon: Package,
      active: pathname.includes('/facts'),
    },
    {
      key: 'presence',
      label: 'Online Presence',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/llms` : '/dashboard',
      icon: Compass,
      active: pathname.includes('/llms'),
    },
    {
      key: 'brands',
      label: 'Brands',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/runs` : '/dashboard',
      icon: Globe,
      active: pathname.includes('/runs'),
    },
    {
      key: 'tasks',
      label: 'Tasks',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/briefs` : '/dashboard',
      icon: FileText,
      active: pathname.includes('/briefs'),
    },
    {
      key: 'settings',
      label: 'Settings',
      href: currentProjectId ? `/dashboard/projects/${currentProjectId}/settings` : '/dashboard',
      icon: Settings,
      active: pathname.includes('/settings'),
    },
  ];

  const userInitial = userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U';
  const isPaid =
    userProfile.plan === 'Pro Plan' ||
    userProfile.plan === 'Starter Plan' ||
    userProfile.plan === 'pro' ||
    userProfile.plan === 'starter';
  const isPro = userProfile.plan === 'Pro Plan' || userProfile.plan === 'pro';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex antialiased selection:bg-slate-900 selection:text-white">
      {/* ============================================================== */}
      {/* 1. LEFT UNIFIED SIDEBAR (Matches ReportView & Competitor)     */}
      {/* ============================================================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-30 fixed lg:static inset-y-0 left-0 hidden lg:flex`}
      >
        <div className="flex flex-col">
          {/* Top Logo & Collapse Toggle */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            {!sidebarCollapsed ? (
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                  <Globe className="h-4 w-4 text-emerald-400" />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-slate-900">
                  AEO Checker
                </span>
              </Link>
            ) : (
              <Link href="/dashboard" className="mx-auto" title="AEO Checker Dashboard">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                  <Globe className="h-4 w-4 text-emerald-400" />
                </span>
              </Link>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Active Website / Domain Selector Dropdown */}
          {!sidebarCollapsed && projectsList.length > 0 && (
            <div className="p-3 pb-1 relative" ref={projectSelectorRef}>
              <button
                type="button"
                onClick={() => setProjectSelectorOpen(!projectSelectorOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold shrink-0">
                    {currentDomain.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{currentDomain}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {projectSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    className="absolute left-3 right-3 top-14 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tracked Websites
                    </div>
                    {projectsList.map((p) => {
                      const isSelected = p.domain === currentDomain;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProjectSelectorOpen(false);
                            router.push(`/dashboard/projects/${p.id}`);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-slate-100 text-slate-950 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{p.domain}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <Link
                        href="/dashboard/projects/new"
                        onClick={() => setProjectSelectorOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Track New Website</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Primary Navigation Links */}
          <div className="p-3 space-y-4">
            {/* AEO Reports Section Header / Item */}
            <div>
              <Link
                href={`/report/${encodeURIComponent(currentDomain)}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/report/')
                    ? 'bg-slate-100 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="AEO Reports"
              >
                <FileText className="h-4 w-4 text-slate-700 shrink-0" />
                {!sidebarCollapsed && <span>AEO Reports</span>}
              </Link>
            </div>

            {/* Daily Analytics Section */}
            <div className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                    Daily Analytics
                  </span>
                  <BarChart3 className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}

              {navLinks
                .filter((item) => !item.isReport)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                      title={item.label}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom User Account Row */}
        <div className="p-3 border-t border-slate-100 relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Account"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white font-bold text-[11px] shadow-2xs">
                {userInitial}
              </span>
              {!sidebarCollapsed && (
                <span className="truncate max-w-[120px] font-semibold text-slate-800">
                  {userProfile.email?.split('@')[0] || 'Account'}
                </span>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
          </button>

          {/* Account Dropdown Popover */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute left-3 right-3 bottom-16 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 space-y-1"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {userProfile.email}
                  </p>
                  <span className="inline-block mt-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {userProfile.plan}
                  </span>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                    <span>All Web Properties</span>
                  </Link>

                  <Link
                    href="/dashboard/projects/new"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                    <span>Track New Website</span>
                  </Link>

                  <Link
                    href="/pricing"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                    <span>Subscription & Plans</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN FULL-WIDTH WORKSPACE CANVAS                            */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
        {/* Top Header Row with Breadcrumbs & Action Buttons */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile Drawer Button + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                AEO Reports
              </Link>
              <span className="text-slate-300">&gt;</span>

              {breadcrumbs && breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.label} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-slate-300">&gt;</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-slate-900 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 font-bold">{crumb.label}</span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-slate-900 font-bold capitalize">
                  {activeSection === 'dashboard' ? currentDomain || 'Dashboard' : activeSection}
                </span>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/report/${encodeURIComponent(currentDomain)}`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Public Report</span>
            </Link>

            {userProfile.plan === undefined ? (
              <div className="h-8 w-24 rounded-xl bg-slate-100 animate-pulse" />
            ) : isPaid ? (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold tracking-wide uppercase shadow-2xs ${
                    isPro
                      ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700'
                      : 'border-blue-500/25 bg-blue-50 text-blue-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPro ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                    }`}
                  />
                  <span>{isPro ? 'PRO ACTIVE' : 'STARTER ACTIVE'}</span>
                </span>
                <Link
                  href="/dashboard/projects/new"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Track Website</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-4 sm:px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:opacity-95 transition-all uppercase tracking-wide cursor-pointer"
              >
                UPGRADE
              </Link>
            )}
          </div>
        </header>

        {/* Page Content Body (Fluid Edge-to-Edge) */}
        <main className="w-full flex-1 min-w-0 bg-[#F8F9FA]">{children}</main>
      </div>

      {/* ============================================================== */}
      {/* 3. MOBILE SIDEBAR DRAWER OVERLAY (< lg)                       */}
      {/* ============================================================== */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-72 bg-white flex flex-col justify-between h-full shadow-2xl z-50 p-4"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                      <Globe className="h-4 w-4 text-emerald-400" />
                    </span>
                    <span className="font-display text-base font-bold text-slate-900">
                      AEO Checker
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="py-4 space-y-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          item.active
                            ? 'bg-slate-100 text-slate-950 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
