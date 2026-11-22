'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MousePointer2, Loader2 } from 'lucide-react';

interface SwarmRebuildApi {
  start: () => void;
  stop: (reveal?: boolean) => void;
  toggle: () => void;
  app: unknown;
}

declare global {
  interface Window {
    __swarmRebuild?: SwarmRebuildApi;
    __swarmNoAutoStart?: boolean;
  }
}

const SCRIPT_SRC = '/cursor-craft/swarm.js';
const SCRIPT_ID = 'cursor-craft-swarm-script';

let loadPromise: Promise<SwarmRebuildApi | null> | null = null;

function ensureSwarmLoaded(): Promise<SwarmRebuildApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.__swarmRebuild) return Promise.resolve(window.__swarmRebuild);
  if (loadPromise) return loadPromise;

  window.__swarmNoAutoStart = true;

  loadPromise = new Promise((resolve) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.__swarmRebuild ?? null), { once: true });
      existing.addEventListener('error', () => {
        loadPromise = null;
        resolve(null);
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.__swarmRebuild ?? null);
    script.onerror = () => {
      loadPromise = null;
      script.remove();
      resolve(null);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

export function CursorCraftButton() {
  const pathname = usePathname();
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevPathRef = useRef(pathname);

  // Preload swarm.js during browser idle time so clicking is instant and unlocks Web Audio synchronously
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => {
        void ensureSwarmLoaded();
      }, { timeout: 2500 });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => {
      void ensureSwarmLoaded();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // Stay in sync with CursorCraft start/stop events (Esc, X, Go live, etc.)
  useEffect(() => {
    const onState = (e: Event) => {
      const detail = (e as CustomEvent<{ running?: boolean }>).detail;
      setRunning(Boolean(detail?.running));
    };
    window.addEventListener('swarm-rebuild:state', onState);
    return () => window.removeEventListener('swarm-rebuild:state', onState);
  }, []);

  // Stop swarm cleanly if user navigates via browser back/forward while active
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (window.__swarmRebuild?.app) {
        window.__swarmRebuild.stop(false);
      }
    }
  }, [pathname]);

  const handleRebuild = useCallback(() => {
    if (loading || running) return;

    // Synchronous path: preserves user-gesture context for Web Audio API
    if (window.__swarmRebuild) {
      window.__swarmRebuild.start();
      return;
    }

    setLoading(true);
    void ensureSwarmLoaded().then((api) => {
      setLoading(false);
      if (api) api.start();
    });
  }, [loading, running]);

  return (
    <button
      type="button"
      onClick={handleRebuild}
      disabled={loading}
      data-swarm-ignore="true"
      aria-label="Rebuild this page with CursorCraft"
      title="Watch a swarm of multiplayer cursors rebuild this page live"
      className={`no-print fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-glass)] px-3.5 py-2 font-sans text-xs font-medium text-[var(--text-primary)] shadow-[0_8px_28px_-8px_rgba(9,9,11,0.22)] dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[0_12px_30px_-8px_rgba(79,70,229,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer select-none ${
        running ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
      ) : (
        <MousePointer2 className="h-3.5 w-3.5 text-[var(--accent)] fill-[var(--accent)]/20" />
      )}
      <span>{loading ? 'Loading…' : 'Rebuild this page'}</span>
    </button>
  );
}
