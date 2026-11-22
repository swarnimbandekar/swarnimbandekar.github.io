import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

export interface BlogHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  formattedDate: string;
  year: string;
  readingTime: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  faq?: BlogFaq[];
}

export interface BlogPost extends BlogPostMeta {
  html: string;
  headings: BlogHeading[];
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function calcReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function extractHeadings(markdown: string): BlogHeading[] {
  const slugger = new GithubSlugger();
  const headings: BlogHeading[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (!match) continue;

    const depth = match[1].length;
    const rawText = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();

    if (!rawText) continue;
    const slug = slugger.slug(rawText);
    if (depth >= 2 && depth <= 3) {
      headings.push({ depth, slug, text: rawText });
    }
  }

  return headings;
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark-default',
        light: 'github-light',
      },
      keepBackground: false,
      defaultLang: 'plaintext',
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(result);
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  const posts: BlogPostMeta[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    if (data.draft) continue;

    const d = new Date(data.date || Date.now());
    const slug = file.replace(/\.md$/, '');
    posts.push({
      slug,
      title: String(data.title || slug),
      description: String(data.description || ''),
      date: d.toISOString(),
      formattedDate: formatDate(d),
      year: d.getFullYear().toString(),
      readingTime: calcReadingTime(content),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      cover: data.cover ? String(data.cover) : undefined,
      draft: Boolean(data.draft),
      faq: Array.isArray(data.faq) ? data.faq : undefined,
    });
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const d = new Date(data.date || Date.now());
  const headings = extractHeadings(content);
  const html = await renderMarkdownToHtml(content);

  return {
    slug,
    title: String(data.title || slug),
    description: String(data.description || ''),
    date: d.toISOString(),
    formattedDate: formatDate(d),
    year: d.getFullYear().toString(),
    readingTime: calcReadingTime(content),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    draft: Boolean(data.draft),
    faq: Array.isArray(data.faq) ? data.faq : undefined,
    headings,
    html,
  };
}
