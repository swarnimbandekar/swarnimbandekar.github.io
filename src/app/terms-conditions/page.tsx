import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for swarnimbandekar.in.',
};

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-10">
      <header className="mb-8 border-b border-[var(--border)] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em]">
          Terms &amp; Conditions
        </h1>
      </header>
      <div className="prose-article">
        <p>
          All writeups, vulnerability research notes, and open-source security tools published on this site are provided strictly for educational purposes and authorized security testing.
        </p>
        <h2>Responsible Use</h2>
        <p>
          Do not use any techniques or scripts documented here against targets without explicit authorization from the system owner.
        </p>
        <h2>Contact</h2>
        <p>
          Questions or disclosure inquiries can be directed through the <Link href="/contact">Contact</Link> page.
        </p>
      </div>
    </div>
  );
}
