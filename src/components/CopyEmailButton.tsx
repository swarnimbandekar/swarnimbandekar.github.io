'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { PROFILE } from '@/data/portfolio';

export function CopyEmailButton({ variant = 'primary' }: { variant?: 'primary' | 'secondary' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        variant === 'primary'
          ? 'inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 font-mono text-xs font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5 cursor-pointer'
          : 'inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 font-mono text-xs text-[var(--text-primary)] transition-colors hover:border-[var(--accent-border)] cursor-pointer'
      }
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#34d399]" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? 'Copied to clipboard' : `Copy ${PROFILE.email}`}</span>
    </button>
  );
}
