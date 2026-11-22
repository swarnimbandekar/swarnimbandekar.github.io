import type { Metadata } from 'next';
import { ResumeClient } from '@/components/ResumeClient';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'Resume and technical background of Swarnim Bandekar - Security Researcher, CRTA (100%), ASCP, and Systems Builder.',
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-10 print:pt-0 print:px-0">
      <header className="mb-8 no-print">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Curriculum Vitae
        </div>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
          Resume
        </h1>
      </header>

      <ResumeClient />
    </div>
  );
}
