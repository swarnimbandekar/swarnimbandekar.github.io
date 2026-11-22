import type { Metadata } from 'next';
import Script from 'next/script';
import {
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CursorPixelTrail } from '@/components/CursorPixelTrail';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import { CursorCraftButton } from '@/components/CursorCraftButton';
import { getAllPosts } from '@/lib/blog';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://swarnimbandekar.in'),
  title: {
    default: 'Swarnim Bandekar · Security Researcher & Systems Builder',
    template: '%s · Swarnim Bandekar',
  },
  description:
    'Offensive security researcher, red teamer, API security specialist, and systems builder based in Bengaluru.',
  icons: {
    icon: '/static/logo.jpg',
    apple: '/static/logo.jpg',
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swarnimbandekar.in',
    siteName: 'Swarnim Bandekar',
    title: 'Swarnim Bandekar · Security Researcher & Systems Builder',
    description:
      'Offensive security researcher, red teamer, API security specialist, and systems builder based in Bengaluru.',
    images: [{ url: '/static/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@dirtrav',
    title: 'Swarnim Bandekar · Security Researcher & Systems Builder',
    description:
      'Offensive security researcher, red teamer, API security specialist, and systems builder based in Bengaluru.',
    images: ['/static/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
  }));

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2057492400378147"
          crossOrigin="anonymous"
        />
        <link rel="sitemap" href="/sitemap.xml" />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-80TXY3SN27"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-80TXY3SN27');
          `}
        </Script>

        <ThemeProvider>
          <CursorPixelTrail />
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
          <CommandPalette posts={posts} />
          <CursorCraftButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
