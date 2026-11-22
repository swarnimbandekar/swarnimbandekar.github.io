'use client';

import { motion } from 'framer-motion';

interface ProjectVisualPreviewProps {
  projectId: string;
  hovered: boolean;
  className?: string;
}

const UNIGUARD_CHANNELS = [
  { label: 'SCAN', rest: 32, active: 56, alert: false },
  { label: 'DDOS', rest: 24, active: 38, alert: false },
  { label: 'DGA', rest: 44, active: 82, alert: true },
  { label: 'C2', rest: 36, active: 92, alert: true },
  { label: 'ENC', rest: 28, active: 52, alert: false },
  { label: 'EXFIL', rest: 40, active: 78, alert: true },
];

/**
 * Minimal architectural micro-diagrams for each Featured / Selected Work project.
 * Responds to parent 3D card hover with subtle physical/state illumination.
 */
export function ProjectVisualPreview({
  projectId,
  hovered,
  className = '',
}: ProjectVisualPreviewProps) {
  return (
    <div
      className={`relative h-40 sm:h-44 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/75 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle 1px hairline drafting grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {projectId === 'bidoytu' && (
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                  hovered ? 'bg-[var(--mint)]' : 'bg-[var(--text-muted)]'
                }`}
              />
              h2 · INTERCEPT
            </span>
            <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[var(--text-secondary)]">
              127.0.0.1:8080
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 font-mono text-[10px] text-[var(--text-secondary)] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
              CLIENT
            </div>

            <div className="relative h-px flex-1 bg-[var(--border-strong)]">
              <motion.span
                animate={{ x: hovered ? ['0%', '320%', '0%'] : '120%', opacity: hovered ? 1 : 0.45 }}
                transition={{ duration: 1.6, repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
                className="absolute -top-[3px] left-0 h-1.5 w-4 rounded-full bg-[var(--accent)]"
              />
            </div>

            <motion.div
              animate={{
                borderColor: hovered ? 'var(--accent-border)' : 'var(--border-strong)',
                scale: hovered ? 1.04 : 1,
              }}
              transition={{ duration: 0.22 }}
              className="rounded-lg border bg-[var(--bg-elevated)] px-3 py-2 text-center shadow-[0_2px_6px_rgba(15,23,42,0.08)] dark:shadow-none"
            >
              <div className="font-mono text-[10px] font-semibold text-[var(--text-primary)]">
                PROXY ENGINE
              </div>
              <div className="font-mono text-[9px] text-[var(--accent)]">
                {hovered ? 'tamper · hold' : 'python + tls'}
              </div>
            </motion.div>

            <div className="relative h-px flex-1 bg-[var(--border-strong)]">
              <motion.span
                animate={{ x: hovered ? ['220%', '0%', '220%'] : '100%', opacity: hovered ? 1 : 0.35 }}
                transition={{ duration: 1.8, repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
                className="absolute -top-[3px] left-0 h-1.5 w-3.5 rounded-full bg-[var(--mint)]"
              />
            </div>

            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 font-mono text-[10px] text-[var(--text-secondary)] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
              UPSTREAM
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[9.5px] text-[var(--text-muted)]">
            <span>Repeater Tab #03</span>
            <span className={hovered ? 'text-[var(--mint)] transition-colors' : ''}>
              {hovered ? 'HTTP/2 200 OK · 4.1ms' : 'Passive audit ready'}
            </span>
          </div>
        </div>
      )}

      {projectId === 'uniguard' && (
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[var(--text-muted)]">PCAP · ZERO-DECRYPT</span>
            <span
              className={`rounded border px-1.5 py-0.5 transition-colors duration-300 ${
                hovered
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              }`}
            >
              6-CLASS TELEMETRY
            </span>
          </div>

          <div className="flex h-20 items-end justify-between gap-2.5 px-2 pt-2">
            {UNIGUARD_CHANNELS.map((ch, idx) => (
              <div key={ch.label} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <motion.div
                    initial={false}
                    animate={{ height: `${hovered ? ch.active : ch.rest}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                      delay: idx * 0.025,
                    }}
                    className={`w-full max-w-[22px] rounded-t-md border transition-colors duration-300 ${
                      hovered && ch.alert
                        ? 'border-[var(--accent-border)] bg-[var(--accent)]/75'
                        : 'border-[var(--border-strong)] bg-zinc-300/75 dark:bg-[var(--bg-elevated)]'
                    }`}
                  />
                </div>
                <span className="font-mono text-[9px] text-[var(--text-muted)]">{ch.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectId === 'glidecast' && (
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[var(--text-muted)]">VIRTUAL CAMERA VIEWFINDER</span>
            <motion.span
              animate={{ color: hovered ? 'var(--accent)' : 'var(--text-muted)' }}
              className="font-mono text-[10px]"
            >
              {hovered ? 'ZOOM 1.8x · CLICK LOCK' : 'RAW + TELEMETRY'}
            </motion.span>
          </div>

          <div className="relative flex-1 my-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/65 overflow-hidden">
            {/* Corner Viewfinder Brackets */}
            <span className="absolute left-2 top-2 h-2.5 w-2.5 border-l border-t border-[var(--border-strong)]" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 border-r border-t border-[var(--border-strong)]" />
            <span className="absolute left-2 bottom-2 h-2.5 w-2.5 border-l border-b border-[var(--border-strong)]" />
            <span className="absolute right-2 bottom-2 h-2.5 w-2.5 border-r border-b border-[var(--border-strong)]" />

            {/* Moving Cursor Target & Zoom Frame */}
            <motion.div
              animate={{
                scale: hovered ? 1.32 : 1,
                x: hovered ? 26 : -14,
                y: hovered ? -6 : 4,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex h-11 w-16 items-center justify-center rounded border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                <span className="h-2.5 w-2.5 rounded-full border border-[var(--accent)]" />
                <span className="absolute h-1 w-1 rounded-full bg-[var(--accent)]" />
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] text-[var(--text-muted)]">
            <span>00:04</span>
            <div className="h-1 flex-1 rounded-full bg-[var(--border)] overflow-hidden">
              <motion.div
                animate={{ width: hovered ? '68%' : '35%' }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-[var(--accent)]"
              />
            </div>
            <span>60fps</span>
          </div>
        </div>
      )}
    </div>
  );
}
