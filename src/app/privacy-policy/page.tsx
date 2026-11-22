import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for swarnimbandekar.in.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-10">
      <header className="mb-8 border-b border-[var(--border)] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em]">
          Privacy Policy
        </h1>
      </header>
      <div className="prose-article">
        <p>
          This website is a personal portfolio and security research blog. It does not require registration or collect personal account data directly.
        </p>
        <h2>Storage &amp; Analytics</h2>
        <p>
          Your selected color theme (dark or light) is saved in browser <code>localStorage</code>. Third-party analytics (Google Analytics) and advertising scripts (Google AdSense) may process standard non-identifying browser telemetry.
        </p>
        <h2>External Links</h2>
        <p>
          Pages link to external platforms such as GitHub, LinkedIn, X, and Medium. Those services maintain their own privacy policies.
        </p>
        <h2>Contact</h2>
        <p>
          For any privacy questions, reach out via the <Link href="/contact">Contact</Link> page.
        </p>
      </div>
    </div>
  );
}
