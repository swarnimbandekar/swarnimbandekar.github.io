'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BlogHeading } from '@/lib/blog';

export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(headings[0]?.slug || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!headings.length) return;

    const onScroll = () => {
      let current = headings[0].slug;
      for (const h of headings) {
        const el = document.getElementById(h.slug);
        if (el && el.getBoundingClientRect().top <= 130) {
          current = h.slug;
        }
      }
      setActiveSlug(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (!headings.length) return null;

  return (
    <>
      {/* Mobile / Tablet Collapsible TOC */}
      <div className="xl:hidden mb-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] cursor-pointer"
        >
          <span>On this page ({headings.length})</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              mobileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {mobileOpen && (
          <nav
            aria-label="Table of contents"
            className="flex flex-col border-t border-[var(--border)] px-3 py-2 max-h-64 overflow-y-auto"
          >
            {headings.map((h) => {
              const active = h.slug === activeSlug;
              return (
                <a
                  key={h.slug}
                  href={`#${h.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg py-1.5 text-xs leading-snug transition-colors ${
                    h.depth === 3 ? 'pl-5 pr-2' : 'px-2'
                  } ${
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Left Rail TOC */}
      <aside className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          On this page
        </div>
        <nav aria-label="Table of contents" className="flex flex-col border-l border-[var(--border)]">
          {headings.map((h) => {
            const active = h.slug === activeSlug;
            return (
              <a
                key={h.slug}
                href={`#${h.slug}`}
                className={`-ml-px border-l-2 py-1.5 text-xs leading-snug transition-colors ${
                  h.depth === 3 ? 'pl-6' : 'pl-3.5'
                } ${
                  active
                    ? 'border-[var(--accent)] text-[var(--text-primary)] font-medium'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {h.text}
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
