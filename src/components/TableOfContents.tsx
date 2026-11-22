'use client';

import { useEffect, useState } from 'react';
import type { BlogHeading } from '@/lib/blog';

export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(headings[0]?.slug || '');

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
  );
}
