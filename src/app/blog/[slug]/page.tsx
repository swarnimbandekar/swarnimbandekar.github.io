import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight, Home } from 'lucide-react';
import { getAllPosts, getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import { TableOfContents } from '@/components/TableOfContents';

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ['Swarnim Bandekar'],
      tags: post.tags,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const nextPost = idx > 0 ? allPosts[idx - 1] : null;

  const blogLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: 'Swarnim Bandekar',
      url: 'https://swarnimbandekar.in',
    },
    datePublished: post.date,
    image: post.cover ? `https://swarnimbandekar.in${post.cover}` : undefined,
    keywords: post.tags.join(', '),
  };

  const faqLd =
    post.faq && post.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqLd ? [blogLd, faqLd] : blogLd),
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,760px)_240px] gap-6 xl:gap-8 justify-center">
        {/* Left Sticky Table of Contents */}
        <div className="xl:col-start-1 min-w-0">
          <TableOfContents headings={post.headings} />
        </div>

        {/* Center Main Article */}
        <article className="xl:col-start-2 min-w-0">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6 flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)] min-w-0">
            <Link href="/" className="shrink-0 hover:text-[var(--text-primary)]" aria-label="Home">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <Link href="/blog" className="shrink-0 hover:text-[var(--text-primary)]">
              Writing
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="min-w-0 truncate text-[var(--text-secondary)]">{post.title}</span>
          </nav>

          {/* Post Header */}
          <header className="border-b border-[var(--border)] pb-6 mb-7 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.15] text-[var(--text-primary)]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 font-mono text-xs text-[var(--text-muted)]">
              <img
                src="/static/logo.jpg"
                alt="Swarnim Bandekar"
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="text-[var(--text-primary)]">Swarnim Bandekar</span>
              <span>·</span>
              <span>{post.formattedDate}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.cover && (
            <img
              src={post.cover}
              alt={post.title}
              className="mb-8 w-full rounded-2xl border border-[var(--border)] object-cover"
            />
          )}

          {/* Rendered Markdown Prose */}
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Prev / Next Navigation */}
          {(prevPost || nextPost) && (
            <nav
              aria-label="Article navigation"
              className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 border-t border-[var(--border)] pt-8"
            >
              {prevPost && (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-5 transition-colors hover:border-[var(--accent-border)]"
                >
                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    <ArrowLeft className="h-3 w-3" /> Previous
                  </div>
                  <div className="font-display mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    {prevPost.title}
                  </div>
                </Link>
              )}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="sm:col-start-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-5 text-left sm:text-right transition-colors hover:border-[var(--accent-border)]"
                >
                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    Next <ArrowRight className="h-3 w-3" />
                  </div>
                  <div className="font-display mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    {nextPost.title}
                  </div>
                </Link>
              )}
            </nav>
          )}
        </article>
      </div>
    </div>
  );
}
