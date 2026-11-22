'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

type BlogCategory = 'all' | 'ctf' | 'certs' | 'bounty' | 'malware';

const CATEGORIES: { id: BlogCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ctf', label: 'CTF Writeups' },
  { id: 'certs', label: 'Certifications' },
  { id: 'bounty', label: 'Bug Bounty' },
  { id: 'malware', label: 'Malware & Forensics' },
];

function classifyPost(tags: string[]): BlogCategory[] {
  const lower = tags.map((t) => t.toLowerCase());
  const cats: BlogCategory[] = [];
  if (lower.some((t) => t.includes('ctf') || t.includes('writeups'))) cats.push('ctf');
  if (lower.some((t) => t.includes('cert') || t.includes('crta') || t.includes('ascp'))) cats.push('certs');
  if (lower.some((t) => t.includes('idor') || t.includes('bug bounty') || t.includes('responsible disclosure'))) cats.push('bounty');
  if (lower.some((t) => t.includes('malware') || t.includes('forensics') || t.includes('stealer'))) cats.push('malware');
  return cats;
}

export function BlogExplorer({ posts }: { posts: BlogPostMeta[] }) {
  const [activeCat, setActiveCat] = useState<BlogCategory>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const cats = classifyPost(post.tags);
      const catOk = activeCat === 'all' || cats.includes(activeCat);
      const textOk =
        !q ||
        `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [posts, activeCat, query]);

  const groupedByYear = useMemo(() => {
    const map = new Map<string, BlogPostMeta[]>();
    for (const post of filtered) {
      const arr = map.get(post.year) || [];
      arr.push(post);
      map.set(post.year, arr);
    }
    return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <div>
      {/* Filter Pills + Search */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCat;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCat(cat.id)}
                className={`relative rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'border border-[var(--border)] bg-[var(--bg-elevated)]/70 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="blog-filter-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[var(--accent)]"
                  />
                )}
                <span className="relative z-10">
                  {cat.id === 'all' ? `All (${posts.length})` : cat.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search writeups or tags..."
            aria-label="Search writeups"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-2 pl-9 pr-4 font-sans text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-border)]"
          />
        </div>
      </div>

      {/* Year-Grouped Posts */}
      <div className="space-y-12">
        {groupedByYear.map(([year, items]) => (
          <section key={year}>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                {year}
              </h2>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {items.length} {items.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              {items.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5 sm:p-6 transition-colors hover:bg-[var(--bg-surface)]/70"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 font-mono text-xs text-[var(--text-muted)]">
                      <span>{post.formattedDate}</span>
                      <span>·</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <h3 className="font-display mt-1.5 text-lg sm:text-xl font-bold tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {post.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 shrink-0">
                    {post.cover && (
                      <img
                        src={post.cover}
                        alt={post.title}
                        width={176}
                        height={106}
                        loading="lazy"
                        className="h-24 w-40 rounded-xl border border-[var(--border)] object-cover"
                      />
                    )}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] transition-all group-hover:border-[var(--accent-border)] group-hover:bg-[var(--accent)] group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] py-14 text-center font-mono text-sm text-[var(--text-muted)]">
          No writeups found for &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
