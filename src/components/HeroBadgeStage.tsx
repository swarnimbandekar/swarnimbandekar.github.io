'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  FileText,
  GripHorizontal,
} from 'lucide-react';
import { PROFILE } from '@/data/portfolio';
import {
  GITHUB_CONTRIBUTIONS_ENDPOINT,
  normalizeContributions,
  type ContributionDay,
  type GitHubContributionsData,
  type RawContributionsPayload,
} from '@/lib/github';
import {
  computeStageLayout,
  createAmbientStars,
  createLanyardState,
  renderAmbientStars,
  renderLanyardForeground,
  resizeLanyardState,
  stepLanyardPhysics,
  type DragState,
  type LanyardState,
} from '@/lib/lanyardPhysics';

function formatContributionDate(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function XBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
    </svg>
  );
}

function GitHubBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z" />
    </svg>
  );
}

export function HeroBadgeStage({
  initialContributions,
}: {
  initialContributions: GitHubContributionsData;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const frontFaceRef = useRef<HTMLDivElement>(null);
  const backFaceRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  const [contributions, setContributions] =
    useState<GitHubContributionsData>(initialContributions);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const flippedTargetRef = useRef(false);

  // Background live refresh of GitHub contributions
  useEffect(() => {
    let cancelled = false;
    fetch(GITHUB_CONTRIBUTIONS_ENDPOINT, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: RawContributionsPayload | null) => {
        if (
          !cancelled &&
          json &&
          Array.isArray(json.contributions) &&
          json.contributions.length > 0
        ) {
          setContributions(normalizeContributions(json));
        }
      })
      .catch(() => {
        // Keep SSR / bundled snapshot on network failure
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll horizontal contribution heatmap to latest weeks on narrow viewports
  useEffect(() => {
    if (isFlipped && heatmapScrollRef.current) {
      const el = heatmapScrollRef.current;
      el.scrollLeft = el.scrollWidth;
    }
  }, [isFlipped, contributions.weeks.length]);

  useEffect(() => {
    const stageEl = stageRef.current;
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    const cardEl = cardRef.current;
    const flipEl = flipRef.current;
    const frontEl = frontFaceRef.current;
    const backEl = backFaceRef.current;
    if (!stageEl || !bgCanvas || !fgCanvas || !cardEl || !flipEl || !frontEl || !backEl) {
      return;
    }

    const bgCtx = bgCanvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!bgCtx || !fgCtx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = createAmbientStars(76);

    const computeCardWidth = (w: number) =>
      w < 640
        ? Math.max(308, Math.min(370, w - 20))
        : Math.max(520, Math.min(760, Math.round(w * 0.54)));

    let stageW = stageEl.clientWidth || window.innerWidth;
    let cardW = computeCardWidth(stageW);
    cardEl.style.width = `${cardW}px`;
    let cardH = cardEl.offsetHeight || (stageW < 640 ? 435 : 465);
    let initialLayout = computeStageLayout(stageW, cardW, cardH);
    let stageH = initialLayout.stageHeight;
    stageEl.style.height = `${stageH}px`;

    const physics: LanyardState = createLanyardState(stageW, cardW, cardH);
    if (!reducedMotion) {
      physics.nodes[9].ox += 4;
      physics.nodes[10].ox += 6;
      physics.nodes[10].oy += 1.5;
    }

    const drag: DragState = {
      active: false,
      targetX: physics.centerX,
      targetY: physics.restCardTopY + cardH * 0.5,
      grabOffsetX: 0,
      grabOffsetY: 0,
    };

    let dpr = Math.min(2, window.devicePixelRatio || 1);
    const syncCanvasSizes = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const cvs of [bgCanvas, fgCanvas]) {
        cvs.width = Math.round(stageW * dpr);
        cvs.height = Math.round(stageH * dpr);
        cvs.style.width = `${stageW}px`;
        cvs.style.height = `${stageH}px`;
      }
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let resizeRafId = 0;
    let fgDirty = true;
    let lastDark: boolean | null = null;
    let lastShowingBack: boolean | null = null;
    let lastCardTransform = '';
    let lastFlipTransform = '';
    let lastGlareBg = '';

    const measureAndResize = () => {
      const nextStageW = stageEl.clientWidth || window.innerWidth;
      const nextCardW = computeCardWidth(nextStageW);
      if (cardEl.style.width !== `${nextCardW}px`) {
        cardEl.style.width = `${nextCardW}px`;
      }
      const nextCardH = cardEl.offsetHeight || (nextStageW < 640 ? 435 : 465);
      const nextLayout = computeStageLayout(nextStageW, nextCardW, nextCardH);
      const nextStageH = nextLayout.stageHeight;

      if (
        nextStageW === stageW &&
        nextCardW === cardW &&
        nextCardH === cardH &&
        nextStageH === stageH
      ) {
        return;
      }

      stageW = nextStageW;
      cardW = nextCardW;
      cardH = nextCardH;
      initialLayout = nextLayout;
      stageH = nextStageH;
      stageEl.style.height = `${stageH}px`;
      resizeLanyardState(physics, stageW, cardW, cardH);
      syncCanvasSizes();

      const darkNow = document.documentElement.classList.contains('dark');
      renderAmbientStars(
        bgCtx,
        stageW,
        stageH,
        stars,
        performance.now() * 0.001,
        darkNow,
        reducedMotion
      );
      renderLanyardForeground(fgCtx, stageW, stageH, physics, darkNow);
      fgDirty = true;
    };

    syncCanvasSizes();

    const ro = new ResizeObserver(() => {
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = 0;
        measureAndResize();
      });
    });
    ro.observe(stageEl);
    ro.observe(cardEl);

    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let glareX = 50;
    let glareY = 28;
    let flipAngle = flippedTargetRef.current ? 180 : 0;
    let flipVel = 0;

    let dragDist = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const applyFaceVisibility = (angleDeg: number) => {
      const showingBack = angleDeg > 90;
      if (showingBack === lastShowingBack) return;
      lastShowingBack = showingBack;
      frontEl.style.visibility = showingBack ? 'hidden' : 'visible';
      frontEl.style.pointerEvents = showingBack ? 'none' : 'auto';
      backEl.style.visibility = showingBack ? 'visible' : 'hidden';
      backEl.style.pointerEvents = showingBack ? 'auto' : 'none';
    };
    applyFaceVisibility(flipAngle);

    const triggerFlip = (kickSign = 1) => {
      flippedTargetRef.current = !flippedTargetRef.current;
      setIsFlipped(flippedTargetRef.current);
      physics.isSettled = false;
      if (reducedMotion) {
        flipAngle = flippedTargetRef.current ? 180 : 0;
        flipVel = 0;
        applyFaceVisibility(flipAngle);
      } else {
        physics.nodes[10].ox -= 2.4 * kickSign;
        physics.nodes[10].oy += 2.2;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, [data-no-flip]')) return;

      e.preventDefault();
      try {
        cardEl.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic events may lack pointerId
      }

      const stageRect = stageEl.getBoundingClientRect();
      const px = e.clientX - stageRect.left;
      const py = e.clientY - stageRect.top;

      const midX = (physics.nodes[9].x + physics.nodes[10].x) * 0.5;
      const midY = (physics.nodes[9].y + physics.nodes[10].y) * 0.5;

      physics.isSettled = false;
      drag.active = true;
      drag.grabOffsetX = midX - px;
      drag.grabOffsetY = midY - py;
      drag.targetX = midX;
      drag.targetY = midY;
      dragDist = 0;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      setIsDragging(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (drag.active) {
        const dx = e.clientX - lastClientX;
        const dy = e.clientY - lastClientY;
        dragDist += Math.hypot(dx, dy);
        lastClientX = e.clientX;
        lastClientY = e.clientY;

        const stageRect = stageEl.getBoundingClientRect();
        const rawX = e.clientX - stageRect.left + drag.grabOffsetX;
        const rawY = e.clientY - stageRect.top + drag.grabOffsetY;

        const minX = Math.max(80, cardW * 0.34);
        const maxX = Math.min(stageW - 80, stageW - cardW * 0.34);
        const minY = physics.restCardTopY + cardH * 0.24;
        const maxY = physics.restCardTopY + cardH * 0.5 + 108 * physics.scale;

        drag.targetX = Math.max(minX, Math.min(maxX, rawX));
        drag.targetY = Math.max(minY, Math.min(maxY, rawY));
        return;
      }

      const rect = cardEl.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const rx = (e.clientX - rect.left) / rect.width - 0.5;
        const ry = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltY = rx * 8;
        targetTiltX = -ry * 6;
        glareX = (rx + 0.5) * 100;
        glareY = (ry + 0.5) * 100;
      }
    };

    const finishPointer = (e: PointerEvent) => {
      if (!drag.active) return;
      try {
        cardEl.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
      drag.active = false;
      setIsDragging(false);

      const target = e.target as HTMLElement | null;
      if (dragDist < 6 && !target?.closest('a, button, [data-no-flip]')) {
        const rect = cardEl.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width * 0.5);
        triggerFlip(relX >= 0 ? 1 : -1);
      }
    };

    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
      glareX = 50;
      glareY = 28;
    };

    let prevScrollY = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - prevScrollY;
      prevScrollY = nextY;
      if (!reducedMotion && Math.abs(delta) > 0.5 && nextY < 450) {
        physics.nodes[10].oy += Math.max(-2.5, Math.min(2.5, delta * 0.04));
        physics.nodes[9].ox -= Math.max(-1.2, Math.min(1.2, delta * 0.015));
        physics.isSettled = false;
      }
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
    cardEl.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    let rafId = 0;
    let lastTs = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(34, Math.max(4, now - lastTs));
      lastTs = now;

      if (!reducedMotion && (!physics.isSettled || drag.active)) {
        stepLanyardPhysics(physics, drag, dt);
      }

      const n9 = physics.nodes[9];
      const topX = n9.x - physics.cardW * 0.5;
      const topY = n9.y - physics.hangTopOffset;

      tiltX += (targetTiltX - tiltX) * 0.14;
      tiltY += (targetTiltY - tiltY) * 0.14;
      if (Math.abs(targetTiltX - tiltX) < 0.02 && targetTiltX === 0) {
        tiltX = 0;
      }
      if (Math.abs(targetTiltY - tiltY) < 0.02 && targetTiltY === 0) {
        tiltY = 0;
      }

      const omitTilt = Math.abs(tiltX) < 0.05 && Math.abs(tiltY) < 0.05;
      const cardTransform = omitTilt
        ? `translate3d(${topX.toFixed(1)}px, ${topY.toFixed(
            1
          )}px, 0) rotate(${physics.swingAngle.toFixed(2)}deg)`
        : `translate3d(${topX.toFixed(1)}px, ${topY.toFixed(
            1
          )}px, 0) rotate(${physics.swingAngle.toFixed(2)}deg) rotateX(${tiltX.toFixed(
            2
          )}deg) rotateY(${tiltY.toFixed(2)}deg)`;

      if (cardTransform !== lastCardTransform) {
        cardEl.style.transform = cardTransform;
        lastCardTransform = cardTransform;
      }

      const targetFlip = flippedTargetRef.current ? 180 : 0;
      if (!reducedMotion) {
        const dtNorm = dt / 16.6667;
        const springF = (targetFlip - flipAngle) * 0.11;
        flipVel = (flipVel + springF * dtNorm) * Math.pow(0.76, dtNorm);
        flipAngle += flipVel * dtNorm;
        if (Math.abs(targetFlip - flipAngle) < 0.08 && Math.abs(flipVel) < 0.08) {
          flipAngle = targetFlip;
          flipVel = 0;
        }
      } else {
        flipAngle = targetFlip;
      }

      const flipTransform = `rotateY(${flipAngle.toFixed(2)}deg)`;
      if (flipTransform !== lastFlipTransform) {
        flipEl.style.transform = flipTransform;
        lastFlipTransform = flipTransform;
      }
      applyFaceVisibility(flipAngle);

      const dark = document.documentElement.classList.contains('dark');

      if (glareRef.current) {
        const dynamicX = Math.max(10, Math.min(90, glareX - physics.swingAngle * 1.4));
        const glareBg = dark
          ? `radial-gradient(circle at ${dynamicX.toFixed(1)}% ${glareY.toFixed(
              1
            )}%, rgba(255,255,255,0.16), rgba(167,139,250,0.06) 34%, transparent 62%)`
          : `radial-gradient(circle at ${dynamicX.toFixed(1)}% ${glareY.toFixed(
              1
            )}%, rgba(255,255,255,0.75), rgba(79,70,229,0.08) 38%, transparent 66%)`;
        if (glareBg !== lastGlareBg) {
          glareRef.current.style.background = glareBg;
          lastGlareBg = glareBg;
        }
      }

      renderAmbientStars(
        bgCtx,
        stageW,
        stageH,
        stars,
        now * 0.001,
        dark,
        reducedMotion
      );
      if (fgDirty || !physics.isSettled || drag.active || dark !== lastDark) {
        renderLanyardForeground(fgCtx, stageW, stageH, physics, dark);
        fgDirty = false;
        lastDark = dark;
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      ro.disconnect();
      cardEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', finishPointer);
      window.removeEventListener('pointercancel', finishPointer);
      cardEl.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flippedTargetRef.current = !flippedTargetRef.current;
      setIsFlipped(flippedTargetRef.current);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const yearSpanLabel = contributions.yearRange || '2025-2026';
  const totalContribLabel = contributions.total.toLocaleString();

  return (
    <section
      aria-label="Interactive Identification Badge"
      className="relative flex flex-col items-center pb-10 dot-field"
    >
      {/* Elastic Physics Lanyard & Hanging Card Stage */}
      <div
        ref={stageRef}
        className="badge-stage h-[690px] sm:h-[710px]"
      >
        <canvas
          ref={bgCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        />

        {/* Physical Hanging ID Card */}
        <div
          ref={cardRef}
          tabIndex={0}
          role="region"
          aria-label="Swarnim Bandekar interactive ID badge. Drag to swing or click card body to flip."
          onKeyDown={handleCardKeyDown}
          style={{ transform: 'translate3d(calc(50vw - 50%), 165px, 0)' }}
          className={`badge-card badge-perspective z-20 w-[356px] sm:w-[740px] ${
            isDragging ? 'is-dragging' : ''
          }`}
        >
          {/* Die-Cut Top Slot Where Clasp Hooks */}
          <div className="badge-slot" aria-hidden="true" />

          {/* 3D Flipper Container (driven by RAF spring) */}
          <div ref={flipRef} className="badge-flip">
            {/* ==================== FRONT FACE ==================== */}
            <div
              ref={frontFaceRef}
              className="badge-face badge-face-front flex flex-col justify-between p-5 pt-7 sm:p-9 sm:pt-10 min-h-[415px] sm:min-h-[455px]"
            >
              <div className="badge-dots pointer-events-none absolute inset-0" />
              <div
                ref={glareRef}
                className="badge-glare pointer-events-none absolute inset-0"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/30 to-transparent" />

              {/* Top Identity Row */}
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-950 dark:text-white">
                      {PROFILE.name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 dark:border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      available
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs sm:text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                    Security researcher · Offensive systems · Bengaluru
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10.5px] text-zinc-500">
                    <GripHorizontal className="h-3.5 w-3.5" /> drag
                  </span>
                  <div className="relative h-11 w-11 sm:h-14 sm:w-14 rounded-full p-[2px] bg-gradient-to-br from-zinc-300 via-zinc-100 to-zinc-300 dark:from-white/25 dark:via-white/5 dark:to-white/20">
                    <img
                      src="/static/logo.jpg"
                      alt="Swarnim Bandekar"
                      width={56}
                      height={56}
                      draggable={false}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Center Editorial Statement */}
              <div className="relative z-10 my-6 sm:my-7">
                <h1 className="font-display text-[clamp(1.6rem,3.05vw,2.55rem)] font-bold leading-[1.11] tracking-[-0.03em] text-zinc-950 dark:text-white">
                  Hi, I’m Swarnim.{' '}
                  <span className="block sm:inline">
                    Offensive security researcher - I{' '}
                    <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#0d9488] dark:from-[#c4b5fd] dark:via-[#f0abfc] dark:to-[#67e8f9] bg-clip-text text-transparent">
                      hack websites when im bored.
                    </span>
                  </span>
                </h1>
                <p className="mt-3.5 max-w-[58ch] text-[13.5px] sm:text-[15.5px] leading-relaxed text-zinc-700 dark:text-zinc-300/90">
                  Focused on web &amp; API penetration testing, Active Directory red teaming, info-stealer forensics, and engineering fast open-source security tooling.
                </p>
              </div>

              {/* Bottom Chips + Subtle Card-Click Hint */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-t border-zinc-200 dark:border-white/10 pt-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex rounded-full border border-zinc-200/80 dark:border-white/10 px-3 py-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    @dirtrav · pixy
                  </span>
                </div>

                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  click card to flip ↻
                </span>
              </div>
            </div>

            {/* ==================== BACK FACE ==================== */}
            <div
              ref={backFaceRef}
              className="badge-face badge-face-back flex flex-col justify-between p-5 pt-7 sm:p-9 sm:pt-10 min-h-[415px] sm:min-h-[455px]"
            >
              <div className="badge-dots pointer-events-none absolute inset-0 opacity-45" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/30 to-transparent" />

              <div>
                {/* Top Meta Bar */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="shrink-0 whitespace-nowrap font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
                    FIND ME
                  </span>
                  <span className="min-w-0 truncate font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.04em] sm:tracking-[0.08em] uppercase text-zinc-600 dark:text-zinc-400">
                    {hoveredDay ? (
                      <>
                        <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                          {hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}
                        </span>{' '}
                        · {formatContributionDate(hoveredDay.date)}
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          {`GITHUB · ${totalContribLabel} CONTRIBUTIONS (${yearSpanLabel})`}
                        </span>
                        <span className="sm:hidden">
                          {`GITHUB · ${totalContribLabel} (${yearSpanLabel})`}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {/* Live GitHub Contribution Heatmap */}
                <div
                  ref={heatmapScrollRef}
                  data-no-flip="true"
                  onMouseLeave={() => setHoveredDay(null)}
                  className="relative z-10 mt-3 rounded-xl border border-zinc-200/90 dark:border-white/10 bg-zinc-100/80 dark:bg-white/[0.03] px-2.5 py-2.5 sm:px-4 sm:py-3.5 overflow-x-auto no-scrollbar"
                >
                  <div className="flex min-w-max sm:min-w-0 sm:w-full justify-between gap-[2.5px] sm:gap-[3.5px]">
                    {contributions.weeks.map((week, wIdx) => (
                      <div
                        key={`week-${wIdx}`}
                        className="flex flex-col gap-[2.5px] sm:gap-[3.5px]"
                      >
                        {week.map((day, dIdx) => {
                          if (!day.date) {
                            return (
                              <span
                                key={`pad-${wIdx}-${dIdx}`}
                                className="block h-[7px] w-[7px] sm:h-[9.5px] sm:w-[9.5px] lg:h-[10px] lg:w-[10px] opacity-0 pointer-events-none"
                              />
                            );
                          }
                          return (
                            <span
                              key={day.date}
                              data-level={day.level}
                              onMouseEnter={() => setHoveredDay(day)}
                              title={`${day.count} contributions on ${day.date}`}
                              className="badge-contrib-cell block h-[7px] w-[7px] sm:h-[9.5px] sm:w-[9.5px] lg:h-[10px] lg:w-[10px] rounded-[2.5px]"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Pills Row */}
                <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={PROFILE.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-sans text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/14 dark:bg-white/[0.05] dark:text-zinc-200 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    <XBrandIcon />
                    <span>X</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                  </a>

                  <a
                    href={PROFILE.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-sans text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/14 dark:bg-white/[0.05] dark:text-zinc-200 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    <LinkedInBrandIcon />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                  </a>

                  <a
                    href={PROFILE.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-sans text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/14 dark:bg-white/[0.05] dark:text-zinc-200 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    <GitHubBrandIcon />
                    <span>GitHub</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                  </a>

                  <a
                    href={PROFILE.socials.medium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-sans text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/14 dark:bg-white/[0.05] dark:text-zinc-200 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:text-white"
                  >
                    <span className="font-serif font-bold text-xs">M</span>
                    <span>Medium</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                  </a>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 font-sans text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/14 dark:bg-white/[0.05] dark:text-zinc-200 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:text-white cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-300">copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Directory Links + Spotify Now Playing */}
              <div className="relative z-10 mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-4 items-end">
                  <div className="flex flex-col gap-1.5 font-sans text-xs sm:text-[13px] font-medium">
                    <Link
                      href="/projects"
                      className="inline-flex w-fit items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>projects</span>
                    </Link>
                    <Link
                      href="/resume"
                      className="inline-flex w-fit items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>resume</span>
                    </Link>
                    <Link
                      href="/blog"
                      className="inline-flex w-fit items-center gap-2 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>writing</span>
                    </Link>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>llms.txt</span>
                    </a>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <a
                      href="https://spotify.swarnimbandekar.in/now-playing?uid=b6d1c197e7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full max-w-[300px] overflow-hidden rounded-xl transition-transform hover:scale-[1.01]"
                    >
                      <img
                        src="https://spotify.swarnimbandekar.in/now-playing?uid=b6d1c197e7"
                        alt="Spotify Now Playing"
                        width={350}
                        height={114}
                        draggable={false}
                        className="block h-auto w-full"
                      />
                    </a>
                    <div className="hidden sm:block text-right font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                      {PROFILE.email}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-white/10 pt-3 font-mono text-[11px]">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">{PROFILE.name}</span>
                  <span className="text-zinc-500">click card to flip back ↻</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Foreground Canvas: Woven "SWARNIM BANDEKAR" Lanyard, Slider Bead & Clasp */}
        <canvas
          ref={fgCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30"
        />
      </div>

      {/* Quick Action Strip Beneath Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 flex flex-wrap items-center justify-center gap-3 px-4"
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 font-sans text-xs sm:text-[13px] font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5"
        >
          <span>View Projects</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/resume"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 font-sans text-xs sm:text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-border)]"
        >
          <span>Inspect Resume</span>
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]/70 px-4 py-2.5 font-sans text-xs sm:text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          <span>Read Writeups</span>
        </Link>
      </motion.div>
    </section>
  );
}
