'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function NotFoundGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);
  const [hint, setHint] = useState('[ SPACE / TAP to jump ]');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const storedHi = Number(localStorage.getItem('404_hi') || '0');
    setHi(storedHi);

    let y = 148;
    let vy = 0;
    let grounded = true;
    let frame = 0;
    let currentScore = 0;
    let bestScore = storedHi;
    let gameOver = false;
    let speed = 4.6;
    const obstacles: { x: number; w: number; h: number }[] = [];
    let rafId = 0;

    const jump = () => {
      if (gameOver) {
        obstacles.length = 0;
        currentScore = 0;
        speed = 4.6;
        y = 148;
        vy = 0;
        grounded = true;
        gameOver = false;
        setScore(0);
        setHint('[ SPACE / TAP to jump ]');
        return;
      }
      if (grounded) {
        vy = -10.5;
        grounded = false;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', jump);

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.strokeStyle = 'rgba(139, 124, 246, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 174);
      ctx.lineTo(canvas.width, 174);
      ctx.stroke();

      if (!gameOver) {
        vy += 0.55;
        y += vy;
        if (y >= 148) {
          y = 148;
          vy = 0;
          grounded = true;
        }

        if (frame % Math.max(48, Math.floor(88 - speed * 3)) === 0) {
          obstacles.push({
            x: canvas.width + 20,
            w: 14 + Math.random() * 10,
            h: 22 + Math.random() * 18,
          });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const ob = obstacles[i];
          ob.x -= speed;
          if (ob.x + ob.w < 0) {
            obstacles.splice(i, 1);
          } else {
            // Collision
            const px = 56;
            const pw = 22;
            const ph = 26;
            if (px < ob.x + ob.w && px + pw > ob.x && y + ph > 174 - ob.h) {
              gameOver = true;
              setHint('CRASHED - [ SPACE / TAP to retry ]');
              if (currentScore > bestScore) {
                bestScore = currentScore;
                setHi(bestScore);
                localStorage.setItem('404_hi', String(bestScore));
              }
            }
          }
        }

        if (frame % 6 === 0) {
          currentScore++;
          setScore(currentScore);
          speed = Math.min(9.5, 4.6 + currentScore * 0.012);
        }
      }

      // Draw Player
      ctx.fillStyle = '#34d399';
      ctx.fillRect(56, y, 22, 26);

      // Draw Obstacles
      ctx.fillStyle = '#8b7cf6';
      for (const ob of obstacles) {
        ctx.fillRect(ob.x, 174 - ob.h, ob.w, ob.h);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', jump);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-[var(--accent)]">
        404
      </div>
      <p className="mt-2 font-mono text-sm text-[var(--text-secondary)]">
        Route not found - play while you’re here.
      </p>

      <div className="mt-8 w-full overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
          <span>SCORE: {score}</span>
          <span>HI: {hi}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={560}
          height={190}
          className="w-full rounded-xl bg-[#09090b] cursor-pointer"
        />
        <p className="mt-2.5 font-mono text-xs text-[var(--text-muted)]">{hint}</p>
      </div>

      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 font-mono text-xs text-[var(--text-primary)] hover:border-[var(--accent-border)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back home</span>
      </Link>
    </div>
  );
}
