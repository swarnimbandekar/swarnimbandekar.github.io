import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogExplorer } from '@/components/BlogExplorer';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Security research, CTF writeups, responsible disclosures, malware reverse engineering, and certification reviews by Swarnim Bandekar.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-10">
      <header className="mb-10 border-b border-[var(--border)] pb-8">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Writing · Research &amp; Writeups
        </div>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
          Dispatches &amp; writeups
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
          Firsthand notes on responsible disclosures, malware reversing, hands-on offensive certifications (CRTA, ASCP), and CTF challenges I’ve solved or built.
        </p>
      </header>

      <BlogExplorer posts={posts} />
    </div>
  );
}
