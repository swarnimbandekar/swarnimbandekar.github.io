'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowUpRight, Copy, SunMoon, FileText, Terminal, CornerDownLeft } from 'lucide-react';
import { PROFILE, PROJECTS } from '@/data/portfolio';

export interface PalettePost {
  slug: string;
  title: string;
  tags: string[];
}

export function CommandPalette({ posts }: { posts: PalettePost[] }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-command-palette', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const navItems = useMemo(
    () => [
      { label: 'Index / Home', hint: '/', keywords: 'home index main', action: () => router.push('/') },
      { label: 'Projects & Tooling', hint: '/projects', keywords: 'projects tools github work', action: () => router.push('/projects') },
      { label: 'Resume / CV', hint: '/resume', keywords: 'resume cv experience crta ascp', action: () => router.push('/resume') },
      { label: 'Security Writeups', hint: '/blog', keywords: 'blog writeups ctf research', action: () => router.push('/blog') },
      { label: 'About', hint: '/about', keywords: 'about bio swarnim', action: () => router.push('/about') },
      { label: 'Contact', hint: '/contact', keywords: 'contact email social', action: () => router.push('/contact') },
    ],
    [router]
  );

  const q = query.trim().toLowerCase();

  const filteredNav = navItems.filter(
    (item) => !q || item.label.toLowerCase().includes(q) || item.keywords.includes(q)
  );
  const filteredProjects = PROJECTS.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.stack.join(' ').toLowerCase().includes(q)
  );
  const filteredPosts = posts.filter(
    (post) =>
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.tags.join(' ').toLowerCase().includes(q)
  );

  const runAndClose = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm no-print"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quick navigation"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page, project, or writeup..."
                className="flex-1 bg-transparent font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {filteredNav.length > 0 && (
                <div className="mb-2">
                  <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Pages
                  </div>
                  {filteredNav.map((item) => (
                    <button
                      key={item.hint}
                      type="button"
                      onClick={() => runAndClose(item.action)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <CornerDownLeft className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span>{item.label}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{item.hint}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {(!q || 'copy email theme dark light print pdf'.includes(q)) && (
                <div className="mb-2">
                  <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Actions
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(PROFILE.email);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Copy className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span>{copied ? 'Email copied!' : `Copy ${PROFILE.email}`}</span>
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">Clipboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runAndClose(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <SunMoon className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span>Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">Theme</span>
                  </button>
                </div>
              )}

              {filteredProjects.length > 0 && (
                <div className="mb-2">
                  <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Projects
                  </div>
                  {filteredProjects.map((proj) => (
                    <a
                      key={proj.id}
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                    >
                      <span className="flex items-center gap-2.5 truncate pr-3">
                        <Terminal className="h-3.5 w-3.5 shrink-0 text-[var(--mint)]" />
                        <span className="truncate">
                          <strong className="font-medium text-[var(--text-primary)]">{proj.title}</strong> - {proj.tagline}
                        </span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                    </a>
                  ))}
                </div>
              )}

              {filteredPosts.length > 0 && (
                <div>
                  <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Writeups
                  </div>
                  {filteredPosts.map((post) => (
                    <button
                      key={post.slug}
                      type="button"
                      onClick={() => runAndClose(() => router.push(`/blog/${post.slug}`))}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 truncate pr-3">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{post.title}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">Read</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredNav.length === 0 && filteredProjects.length === 0 && filteredPosts.length === 0 && (
                <div className="py-8 text-center font-mono text-xs text-[var(--text-muted)]">
                  No matches for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
