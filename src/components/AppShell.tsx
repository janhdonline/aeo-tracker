'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogoMark } from '@/components/landing/BrandLogos';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface AppShellProps {
  user: { email?: string };
  children: React.ReactNode;
}

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AppShell({ user, children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.18 }}
          >
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="text-[17px] font-semibold tracking-[-0.035em] text-slate-900">
                AEO Visibility Tracker
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              New Project
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-slate-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-slate-900 lg:hidden"
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
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
            >
              <div className="px-4 pb-4 pt-3">
                <nav className="flex flex-col" aria-label="Mobile navigation">
                  {[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'New Project', href: '/dashboard/projects/new' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.href}
                      custom={i}
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <motion.div
                  custom={2}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="show"
                  className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3"
                >
                  <span className="px-3 text-sm text-slate-600">{user.email}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {children}
    </div>
  );
}