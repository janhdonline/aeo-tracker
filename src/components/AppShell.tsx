'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogoMark } from '@/components/landing/BrandLogos';
import { Menu, X, LogOut, ChevronDown, LayoutDashboard, Plus } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface AppShellProps {
  user: { email?: string };
  children: React.ReactNode;
}

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export function AppShell({ user, children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#fafafa] dashboard-ambient text-slate-900">
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <LogoMark className="h-8 w-8 transition-transform duration-200 group-hover:scale-105" />
              <span className="text-[16px] font-bold tracking-tight text-slate-900">
                AEO Visibility Tracker
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links (>= lg) */}
          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary navigation">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              New Project
            </Link>
          </nav>

          {/* Desktop User Avatar Dropdown (Only on >= lg) */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1 pl-1 pr-2 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer"
              aria-label="User profile menu"
            >
              <div className="h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Popover Dropdown */}
            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-card z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/projects/new"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-slate-400" />
                      New Project
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile / Tablet Hamburger Toggle (< lg) */}
          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:text-slate-900 lg:hidden cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile / Tablet Drawer (< lg) */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="overflow-hidden border-t border-slate-100 bg-white lg:hidden shadow-lg"
            >
              <div className="px-4 pb-4 pt-3 space-y-3">
                <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/projects/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-slate-400" />
                    <span>New Project</span>
                  </Link>
                </nav>

                {/* User info & Logout cleanly positioned ONLY inside the drawer */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {userInitial}
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 transition-colors shrink-0 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {children}
    </div>
  );
}