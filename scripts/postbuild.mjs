import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const outDir = path.join(root, 'out');
const blogDir = path.join(root, 'content', 'blog');
const siteUrl = 'https://swarnimbandekar.in';

if (!fs.existsSync(outDir)) {
  console.error('Error: out/ directory does not exist.');
  process.exit(1);
}

// 1. Ensure .nojekyll exists so GitHub Pages serves _next/ static chunks
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

// 2. Ensure CNAME is present in out/
const cnamePath = path.join(root, 'CNAME');
if (fs.existsSync(cnamePath)) {
  fs.copyFileSync(cnamePath, path.join(outDir, 'CNAME'));
}

// 3. Read blog posts for RSS & Sitemap
const posts = [];
if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const { data } = matter(raw);
    if (data.draft) continue;
    const slug = file.replace(/\.mdx?$/, '');
    posts.push({
      slug,
      title: String(data.title || slug),
      description: String(data.description || ''),
      date: new Date(data.date || Date.now()),
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  }
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// 4. Generate out/rss.xml
const rssItems = posts
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}/</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`
  )
  .join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Swarnim Bandekar</title>
    <link>${siteUrl}</link>
    <description>Security research, CTF writeups, vulnerability disclosures, and offensive tooling by Swarnim Bandekar.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(outDir, 'rss.xml'), rssXml, 'utf8');

// 5. Generate out/sitemap.xml
const staticRoutes = ['/', '/projects/', '/resume/', '/blog/', '/about/', '/contact/'];
const allUrls = [
  ...staticRoutes.map((route) => ({
    loc: `${siteUrl}${route}`,
    lastmod: new Date().toISOString().split('T')[0],
  })),
  ...posts.map((p) => ({
    loc: `${siteUrl}/blog/${p.slug}/`,
    lastmod: p.date.toISOString().split('T')[0],
  })),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Postbuild complete: .nojekyll, CNAME, rss.xml (${posts.length} posts), sitemap.xml (${allUrls.length} URLs).`);
