'use client';

import { useEffect, useRef } from 'react';

interface PixelCell {
  born: number;
  color: string;
  life: number;
  maxAlpha: number;
}

const DARK_PALETTE = [
  '#4c1d95',
  '#6d28d9',
  '#8b7cf6',
  '#a78bfa',
  '#34d399',
  '#67e8f9',
];

const LIGHT_PALETTE = [
  '#3730a3',
  '#4f46e5',
  '#6366f1',
  '#16a34a',
  '#22c55e',
  '#84cc16',
];

const CELL_SIZE = 8;

/**
 * Ambient 8px quantized cursor pixel-ribbon trail rendered onto a fixed background canvas.
 * Drops cleanly to 0% idle CPU when cells finish decaying.
 */
export function CursorPixelTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cells = new Map<string, PixelCell>();
    let prevPos: { x: number; y: number } | null = null;
    let rafId = 0;
    let resizeRafId = 0;
    let viewW = 0;
    let viewH = 0;

    const syncCanvasSize = () => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      if (nextW === viewW && nextH === viewH) return;
      viewW = nextW;
      viewH = nextH;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(nextW * dpr);
      canvas.height = Math.round(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    syncCanvasSize();

    const onWindowResize = () => {
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = 0;
        syncCanvasSize();
      });
    };

    const tick = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, viewW, viewH);

      cells.forEach((cell, key) => {
        const progress = (now - cell.born) / cell.life;
        if (progress >= 1) {
          cells.delete(key);
          return;
        }
        const step = Math.floor(progress * 4);
        const alpha = cell.maxAlpha * (1 - step / 4);
        const inset = step >= 3 ? 2 : step >= 2 ? 1 : 0;
        const size = 7 - inset * 2;
        const [gx, gy] = key.split(',').map(Number);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = cell.color;
        ctx.fillRect(gx * CELL_SIZE + inset, gy * CELL_SIZE + inset, size, size);
      });

      ctx.globalAlpha = 1;
      rafId = cells.size > 0 ? requestAnimationFrame(tick) : 0;
    };

    const stampCell = (gx: number, gy: number, baseIdx: number, isDark: boolean) => {
      const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
      const idx =
        Math.random() < 0.08
          ? 0
          : Math.min(palette.length - 1, baseIdx + Math.floor(Math.random() * 2));

      cells.set(`${gx},${gy}`, {
        born: performance.now(),
        color: palette[idx],
        life: 880 * (0.7 + 0.5 * Math.random()),
        maxAlpha: isDark ? 0.68 : 0.82,
      });
    };

    const stampCluster = (x: number, y: number, isDark: boolean) => {
      const gx = Math.floor(x / CELL_SIZE);
      const gy = Math.floor(y / CELL_SIZE);
      stampCell(gx, gy, 1, isDark);

      const cardinals = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dy] of cardinals) {
        if (Math.random() < 0.75) {
          stampCell(gx + dx, gy + dy, 3, isDark);
        }
      }

      for (let i = 0; i < 3; i++) {
        if (Math.random() < 0.46) {
          const sx = Math.round((Math.random() - 0.5) * 6);
          const sy = Math.round((Math.random() - 0.5) * 6);
          stampCell(gx + sx, gy + sy, 4, isDark);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const isDark = document.documentElement.classList.contains('dark');
      const x = e.clientX;
      const y = e.clientY;

      if (prevPos) {
        const dist = Math.hypot(x - prevPos.x, y - prevPos.y);
        const steps = Math.max(1, Math.min(26, Math.floor(dist / CELL_SIZE)));
        for (let i = 1; i <= steps; i++) {
          const ix = prevPos.x + ((x - prevPos.x) * i) / steps;
          const iy = prevPos.y + ((y - prevPos.y) * i) / steps;
          stampCluster(ix, iy, isDark);
        }
      } else {
        stampCluster(x, y, isDark);
      }

      prevPos = { x, y };
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const resetPrevPos = () => {
      prevPos = null;
    };

    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', resetPrevPos);
    window.addEventListener('blur', resetPrevPos);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', resetPrevPos);
      window.removeEventListener('blur', resetPrevPos);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-swarm-ignore="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
