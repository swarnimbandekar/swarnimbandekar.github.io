'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'index' },
  { href: '/projects', label: 'projects' },
  { href: '/resume', label: 'resume' },
  { href: '/blog', label: 'writing' },
  { href: '/about', label: 'about' },
];

export function Navbar() {
  const pathname = usePathname() || '/';
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 28);
  });

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
        scrolled ? 'pt-3 px-4' : 'pt-4 px-4 sm:px-6'
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'max-w-3xl rounded-full border border-[var(--border-strong)] bg-[var(--bg-glass)] px-3 py-1.5 backdrop-blur-xl shadow-[0_10px_28px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)]'
            : 'max-w-6xl rounded-full border border-[var(--border)] bg-[var(--bg-glass)] px-4 py-2 backdrop-blur-lg shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] dark:shadow-none'
        }`}
      >
        {/* Left Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full py-0.5 pl-0.5 pr-2 transition-opacity hover:opacity-85"
        >
          <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)]">
            <img
              src="/static/logo.jpg"
              alt="Swarnim Bandekar"
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="font-mono text-xs font-medium tracking-tight text-[var(--text-primary)]">
            swarnim
            <span className="hidden sm:inline text-[var(--text-muted)]"> · pixy</span>
          </span>
        </Link>

        {/* Center Navigation Pill with Framer Motion layoutId */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3.5 py-1.5 font-sans text-[13px] transition-colors ${
                  active
                    ? 'text-[var(--text-primary)] font-semibold'
                    : 'font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)]"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Utilities */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command menu"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/70 px-2.5 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Search className="h-3 w-3" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="rounded border border-[var(--border)] px-1 py-0.2 text-[10px] leading-none">
              ⌘K
            </kbd>
          </button>

          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            title="For the robots"
          >
            llms.txt
          </a>

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark or light theme"
            className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )
            ) : (
              <span className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 -z-10 bg-black/25 backdrop-blur-[2px] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-2 max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-3 shadow-2xl md:hidden"
            >
              <nav className="grid grid-cols-2 gap-1.5">
                {[...NAV_ITEMS, { href: '/contact', label: 'contact' }].map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-xl border px-3.5 py-3 font-sans text-sm transition-colors ${
                        active
                          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold'
                          : 'border-[var(--border)] font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border)] pt-2.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openPalette();
                  }}
                  className="inline-flex items-center gap-1.5 py-1.5 font-mono text-xs text-[var(--text-muted)]"
                >
                  <Search className="h-3.5 w-3.5" /> Search everything
                </button>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 font-mono text-xs text-[var(--text-muted)]"
                >
                  llms.txt ↗
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
