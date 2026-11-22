export interface LanyardNode {
  x: number;
  y: number;
  ox: number;
  oy: number;
  pin?: boolean;
}

export interface LanyardConstraint {
  a: number;
  b: number;
  rest: number;
  minOnly?: boolean;
  stiffness: number;
  elastic?: boolean;
}

export interface DragState {
  active: boolean;
  targetX: number;
  targetY: number;
  grabOffsetX: number;
  grabOffsetY: number;
}

export interface LanyardState {
  nodes: LanyardNode[];
  constraints: LanyardConstraint[];
  centerX: number;
  anchorY: number;
  scale: number;
  cardW: number;
  cardH: number;
  hangTopOffset: number;
  restCardTopY: number;
  swingAngle: number;
  angularVel: number;
  accumulator: number;
  isSettled: boolean;
  scratchLeft: Array<{ x: number; y: number }>;
  scratchRight: Array<{ x: number; y: number }>;
  scratchStem: Array<{ x: number; y: number }>;
}

export interface AmbientStar {
  xFrac: number;
  yFrac: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/**
 * Computes responsive card & lanyard scale from viewport dimensions.
 */
export function computeStageLayout(viewportW: number, cardW: number, cardH: number) {
  const isMobile = viewportW < 640;
  const scale = isMobile
    ? clamp(cardW / 440, 0.78, 0.96)
    : clamp(cardW / 580, 0.88, 1.2);

  // Start pinned anchors tucked behind the fixed top Navbar pill (~16px-60px).
  const anchorY = 14;
  const armSpread = 34 * scale;
  const sliderDrop = 96 * scale;
  const loopDrop = 20 * scale;
  const swivelDrop = 16 * scale;
  const claspDrop = 16 * scale;
  const claspOverlap = 6 * scale;
  const restSlotY = anchorY + sliderDrop + loopDrop + swivelDrop + claspDrop;
  const restCardTopY = restSlotY - claspOverlap;

  return {
    scale,
    anchorY,
    armSpread,
    sliderDrop,
    loopDrop,
    swivelDrop,
    claspDrop,
    claspOverlap,
    restSlotY,
    restCardTopY,
    stageHeight: Math.round(restCardTopY + cardH + (isMobile ? 46 : 64)),
  };
}

/**
 * Initializes the 11-node elastic Verlet rope + rigid ID badge spine.
 */
export function createLanyardState(
  stageW: number,
  cardW: number,
  cardH: number
): LanyardState {
  const centerX = stageW / 2;
  const layout = computeStageLayout(stageW, cardW, cardH);
  const { anchorY, armSpread, sliderDrop, loopDrop, swivelDrop, claspDrop, scale } = layout;

  const s1 = 1 / 3;
  const s2 = 2 / 3;
  const sliderY = anchorY + sliderDrop;
  const n7y = sliderY + loopDrop;
  const n8y = n7y + swivelDrop;
  const n9y = n8y + claspDrop;
  const n10y = n9y + cardH;

  const makeNode = (x: number, y: number, pin = false): LanyardNode => ({
    x,
    y,
    ox: x,
    oy: y,
    pin,
  });

  const nodes: LanyardNode[] = [
    makeNode(centerX - armSpread, anchorY, true), // 0: Left pinned top anchor
    makeNode(centerX - armSpread * (1 - s1), anchorY + sliderDrop * s1), // 1
    makeNode(centerX - armSpread * (1 - s2), anchorY + sliderDrop * s2), // 2
    makeNode(centerX, sliderY), // 3: Crimp / slider convergence
    makeNode(centerX + armSpread, anchorY, true), // 4: Right pinned top anchor
    makeNode(centerX + armSpread * (1 - s1), anchorY + sliderDrop * s1), // 5
    makeNode(centerX + armSpread * (1 - s2), anchorY + sliderDrop * s2), // 6
    makeNode(centerX, n7y), // 7: Woven loop base
    makeNode(centerX, n8y), // 8: Swivel ring
    makeNode(centerX, n9y), // 9: Clasp tip at badge slot
    makeNode(centerX, n10y), // 10: Rigid card center-bottom mass
  ];

  const armSegLen = Math.hypot(armSpread, sliderDrop) / 3;
  const constraints: LanyardConstraint[] = [
    // Taut woven V-strap ribbons
    { a: 0, b: 1, rest: armSegLen, stiffness: 0.88, elastic: true },
    { a: 1, b: 2, rest: armSegLen, stiffness: 0.88, elastic: true },
    { a: 2, b: 3, rest: armSegLen, stiffness: 0.88, elastic: true },
    { a: 4, b: 5, rest: armSegLen, stiffness: 0.88, elastic: true },
    { a: 5, b: 6, rest: armSegLen, stiffness: 0.88, elastic: true },
    { a: 6, b: 3, rest: armSegLen, stiffness: 0.88, elastic: true },
    // Woven collar + swivel links
    { a: 3, b: 7, rest: loopDrop, stiffness: 0.92, elastic: true },
    { a: 7, b: 8, rest: swivelDrop, stiffness: 0.94, elastic: true },
    { a: 8, b: 9, rest: claspDrop, stiffness: 0.96, elastic: true },
    // Rigid ID badge spine (never stretches or compresses)
    { a: 9, b: 10, rest: cardH, stiffness: 1.0, elastic: false },
    // Anti-fold guard keeping the clasp above the badge body
    { a: 8, b: 10, rest: cardH + claspDrop * 0.88, minOnly: true, stiffness: 0.92 },
  ];

  return {
    nodes,
    constraints,
    centerX,
    anchorY,
    scale,
    cardW,
    cardH,
    hangTopOffset: layout.claspOverlap,
    restCardTopY: layout.restCardTopY,
    swingAngle: 0,
    angularVel: 0,
    accumulator: 0,
    isSettled: false,
    scratchLeft: [],
    scratchRight: [],
    scratchStem: [],
  };
}

/**
 * Updates pin positions and badge spine length on resize without resetting motion.
 */
export function resizeLanyardState(
  state: LanyardState,
  stageW: number,
  cardW: number,
  cardH: number
) {
  const prevCenterX = state.centerX;
  const newCenterX = stageW / 2;
  const dx = newCenterX - prevCenterX;
  const layout = computeStageLayout(stageW, cardW, cardH);

  for (const node of state.nodes) {
    node.x += dx;
    node.ox += dx;
  }

  state.nodes[0].x = newCenterX - layout.armSpread;
  state.nodes[0].y = layout.anchorY;
  state.nodes[0].ox = state.nodes[0].x;
  state.nodes[0].oy = state.nodes[0].y;

  state.nodes[4].x = newCenterX + layout.armSpread;
  state.nodes[4].y = layout.anchorY;
  state.nodes[4].ox = state.nodes[4].x;
  state.nodes[4].oy = state.nodes[4].y;

  const armSegLen = Math.hypot(layout.armSpread, layout.sliderDrop) / 3;
  state.constraints[0].rest = armSegLen;
  state.constraints[1].rest = armSegLen;
  state.constraints[2].rest = armSegLen;
  state.constraints[3].rest = armSegLen;
  state.constraints[4].rest = armSegLen;
  state.constraints[5].rest = armSegLen;
  state.constraints[6].rest = layout.loopDrop;
  state.constraints[7].rest = layout.swivelDrop;
  state.constraints[8].rest = layout.claspDrop;
  state.constraints[9].rest = cardH;
  state.constraints[10].rest = cardH + layout.claspDrop * 0.88;

  state.centerX = newCenterX;
  state.anchorY = layout.anchorY;
  state.scale = layout.scale;
  state.cardW = cardW;
  state.cardH = cardH;
  state.hangTopOffset = layout.claspOverlap;
  state.restCardTopY = layout.restCardTopY;
  state.isSettled = false;
}

const FIXED_DT = 16.6667;

/**
 * Steps the 2D elastic Verlet rope & rigid badge spine using a fixed-timestep accumulator.
 */
export function stepLanyardPhysics(
  state: LanyardState,
  drag: DragState,
  dtMs: number
) {
  const clampedDt = clamp(dtMs, 0, 34);
  state.accumulator += clampedDt;

  const { nodes, constraints, centerX } = state;
  const gravity = 0.42;
  const damping = 0.935;
  const iterations = 12;

  let steps = 0;
  while (state.accumulator >= FIXED_DT && steps < 2) {
    state.accumulator -= FIXED_DT;
    steps++;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.pin) continue;

      const vx = clamp((n.x - n.ox) * damping, -28, 28);
      const vy = clamp((n.y - n.oy) * damping, -28, 28);
      n.ox = n.x;
      n.oy = n.y;
      n.x += vx;
      n.y += vy + gravity;

      // Subtle centering nudge only when displaced away from center
      if (i === 3 && Math.abs(centerX - n.x) > 1.5) {
        n.x += (centerX - n.x) * 0.004;
      }
    }

    // Elastic drag pull applied smoothly to badge center (midpoint of 9 and 10)
    if (drag.active) {
      const n9 = nodes[9];
      const n10 = nodes[10];
      const midX = (n9.x + n10.x) * 0.5;
      const midY = (n9.y + n10.y) * 0.5;

      const pullX = (drag.targetX - midX) * 0.36;
      const pullY = (drag.targetY - midY) * 0.32;

      n9.x += pullX * 0.85;
      n9.y += pullY * 0.85;
      n10.x += pullX * 1.15;
      n10.y += pullY * 1.15;

      // Damped pointer velocity tracking so flinging preserves natural momentum
      n9.ox = n9.x - clamp(pullX * 0.5, -18, 18);
      n9.oy = n9.y - clamp(pullY * 0.5, -18, 18);
      n10.ox = n10.x - clamp(pullX * 0.65, -20, 20);
      n10.oy = n10.y - clamp(pullY * 0.65, -20, 20);
    }

    for (let iter = 0; iter < iterations; iter++) {
      for (let c = 0; c < constraints.length; c++) {
        const con = constraints[c];
        const a = nodes[con.a];
        const b = nodes[con.b];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        if (con.minOnly && dist >= con.rest) continue;

        const diff = (dist - con.rest) / dist;
        const effStiffness =
          con.elastic && drag.active ? con.stiffness * 0.42 : con.stiffness;

        const wA = a.pin ? 0 : 1;
        const wB = b.pin ? 0 : 1;
        const wSum = wA + wB;
        if (!wSum) continue;

        const corrX = dx * diff * effStiffness;
        const corrY = dy * diff * effStiffness;

        a.x += (corrX * wA) / wSum;
        a.y += (corrY * wA) / wSum;
        b.x -= (corrX * wB) / wSum;
        b.y -= (corrY * wB) / wSum;
      }

      // Keep clasp hook & card body safely within stage vertical floor/ceiling
      const n9 = nodes[9];
      const n10 = nodes[10];
      if (n9.y < state.anchorY + 46 * state.scale) {
        n9.y = state.anchorY + 46 * state.scale;
      }
      const maxY = state.restCardTopY + state.cardH + 115 * state.scale;
      if (n10.y > maxY) {
        n10.y = maxY;
      }
    }

    const n9 = nodes[9];
    const n10 = nodes[10];
    const spineAngleRad = Math.atan2(n10.y - n9.y, n10.x - n9.x) - Math.PI / 2;
    const stepTargetDeg = clamp((spineAngleRad * 180) / Math.PI, -22, 22);
    state.swingAngle += (stepTargetDeg - state.swingAngle) * 0.18;
  }

  if (state.accumulator >= FIXED_DT) {
    state.accumulator = FIXED_DT * 0.5;
  }

  const n9 = nodes[9];
  const n10 = nodes[10];
  const spineAngleRad = Math.atan2(n10.y - n9.y, n10.x - n9.x) - Math.PI / 2;
  const targetDeg = clamp((spineAngleRad * 180) / Math.PI, -22, 22);

  if (!drag.active) {
    let kineticEnergy = 0;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.pin) continue;
      const vx = n.x - n.ox;
      const vy = n.y - n.oy;
      kineticEnergy += vx * vx + vy * vy;
    }

    if (kineticEnergy < 0.02 && Math.abs(targetDeg - state.swingAngle) < 0.06) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.pin) continue;
        n.ox = n.x;
        n.oy = n.y;
      }
      state.swingAngle = targetDeg;
      state.accumulator = 0;
      state.isSettled = true;
      return;
    }
  }

  state.isSettled = false;
}

function sampleCatmullRom(
  pts: LanyardNode[],
  subdivisions: number,
  out: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  let count = 0;
  const len = pts.length;
  for (let i = 0; i < len - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(len - 1, i + 2)];

    for (let s = 0; s < subdivisions; s++) {
      const t = s / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      const item = out[count] ?? { x: 0, y: 0 };
      item.x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      item.y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      out[count++] = item;
    }
  }

  const last = out[count] ?? { x: 0, y: 0 };
  last.x = pts[len - 1].x;
  last.y = pts[len - 1].y;
  out[count++] = last;
  out.length = count;
  return out;
}

interface RibbonStyle {
  width: number;
  front: string;
  back: string;
  edge: string;
  stitch: string;
  printText?: string;
  printColor?: string;
  printFont?: string;
  phase?: number;
  twistMul: number;
}

function drawWovenRibbon(
  ctx: CanvasRenderingContext2D,
  pts: Array<{ x: number; y: number }>,
  style: RibbonStyle
) {
  const n = pts.length;
  if (n < 2) return;

  const arcLen: number[] = new Array(n);
  const tx: number[] = new Array(n);
  const ty: number[] = new Array(n);
  const nx: number[] = new Array(n);
  const ny: number[] = new Array(n);
  const twist: number[] = new Array(n);

  arcLen[0] = 0;
  for (let i = 1; i < n; i++) {
    arcLen[i] =
      arcLen[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  const totalLen = arcLen[n - 1] || 1;

  const hw: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const mag = Math.hypot(dx, dy) || 1;
    tx[i] = dx / mag;
    ty[i] = dy / mag;
    nx[i] = -ty[i];
    ny[i] = tx[i];
    twist[i] = Math.cos((arcLen[i] / totalLen) * style.twistMul);
    hw[i] = style.width * 0.5 * Math.max(0.75, Math.abs(twist[i]));
  }

  // Draw the entire ribbon body as one continuous closed polygon (drop shadow only on fill)
  ctx.beginPath();
  ctx.moveTo(pts[0].x + nx[0] * hw[0], pts[0].y + ny[0] * hw[0]);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(pts[i].x + nx[i] * hw[i], pts[i].y + ny[i] * hw[i]);
  }
  for (let i = n - 1; i >= 0; i--) {
    ctx.lineTo(pts[i].x - nx[i] * hw[i], pts[i].y - ny[i] * hw[i]);
  }
  ctx.closePath();

  ctx.fillStyle = style.front;
  ctx.fill();

  // Clear shadow before stroking outline, stitch rails, and printed text
  ctx.save();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = style.edge;
  ctx.lineWidth = 0.75;
  ctx.stroke();

  // Two continuous inner dashed stitch rails
  ctx.strokeStyle = style.stitch;
  ctx.lineWidth = 0.75;
  ctx.setLineDash([3, 3]);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(
      pts[0].x + side * nx[0] * hw[0] * 0.76,
      pts[0].y + side * ny[0] * hw[0] * 0.76
    );
    for (let i = 1; i < n; i++) {
      ctx.lineTo(
        pts[i].x + side * nx[i] * hw[i] * 0.76,
        pts[i].y + side * ny[i] * hw[i] * 0.76
      );
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Character-by-character curved name print along smoothly interpolated ribbon tangent
  if (style.printText && style.printColor && style.printFont) {
    ctx.font = style.printFont;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = style.printColor;
    const text = style.printText;
    let cursor = style.phase ?? 16;
    let charIdx = 0;

    while (cursor < totalLen - 10) {
      const ch = text[charIdx % text.length];
      const chAdvance = ctx.measureText(ch).width + 1.3;

      let seg = 0;
      while (seg < n - 2 && arcLen[seg + 1] < cursor) seg++;
      const segSpan = arcLen[seg + 1] - arcLen[seg] || 1;
      const frac = clamp((cursor - arcLen[seg]) / segSpan, 0, 1);

      const mx = pts[seg].x + (pts[seg + 1].x - pts[seg].x) * frac;
      const my = pts[seg].y + (pts[seg + 1].y - pts[seg].y) * frac;

      if (ch !== ' ') {
        const itx = tx[seg] + (tx[seg + 1] - tx[seg]) * frac;
        const ity = ty[seg] + (ty[seg + 1] - ty[seg]) * frac;
        const twistScale =
          Math.max(0.75, Math.abs(twist[seg] + (twist[seg + 1] - twist[seg]) * frac));

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(Math.atan2(ity, itx));
        ctx.scale(1, twistScale);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      }

      cursor += chAdvance;
      charIdx++;
    }
  }

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Renders the woven `"SWARNIM BANDEKAR"` V-strap, brushed chrome crimp slider,
 * swivel collar, and lobster clasp hooked cleanly into the badge top slot.
 */
export function renderLanyardForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: LanyardState,
  isDark: boolean
) {
  ctx.clearRect(0, 0, width, height);

  const { nodes, scale, scratchLeft, scratchRight, scratchStem } = state;

  const leftSpline = sampleCatmullRom(
    [nodes[0], nodes[1], nodes[2], nodes[3]],
    7,
    scratchLeft
  );
  // Reverse traversal on right arm so printed text remains right-side up
  const rightSpline = sampleCatmullRom(
    [nodes[3], nodes[6], nodes[5], nodes[4]],
    7,
    scratchRight
  );
  const stemSpline = sampleCatmullRom([nodes[3], nodes[7], nodes[8]], 6, scratchStem);

  const palette = isDark
    ? {
        front: '#ebe8e1',
        back: '#ccc8be',
        edge: 'rgba(255,255,255,0.22)',
        stitch: 'rgba(18,18,22,0.22)',
        print: 'rgba(14,14,18,0.88)',
      }
    : {
        front: '#16161b',
        back: '#2b2b34',
        edge: 'rgba(0,0,0,0.35)',
        stitch: 'rgba(255,255,255,0.22)',
        print: 'rgba(244,244,247,0.92)',
      };

  const ribbonW = 15.5 * scale;
  const fontPx = Math.max(6.8, 7.8 * scale).toFixed(1);
  const printFont = `700 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, monospace`;

  // Subtle ribbon drop shadow
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetY = 4 * scale;

  drawWovenRibbon(ctx, leftSpline, {
    width: ribbonW,
    front: palette.front,
    back: palette.back,
    edge: palette.edge,
    stitch: palette.stitch,
    printText: 'SWARNIM BANDEKAR  ·  ',
    printColor: palette.print,
    printFont,
    phase: 22 * scale,
    twistMul: 0.22,
  });

  drawWovenRibbon(ctx, rightSpline, {
    width: ribbonW,
    front: palette.front,
    back: palette.back,
    edge: palette.edge,
    stitch: palette.stitch,
    printText: 'SWARNIM BANDEKAR  ·  ',
    printColor: palette.print,
    printFont,
    phase: 8 * scale,
    twistMul: 0.22,
  });

  drawWovenRibbon(ctx, stemSpline, {
    width: ribbonW * 0.82,
    front: palette.front,
    back: palette.back,
    edge: palette.edge,
    stitch: palette.stitch,
    twistMul: 0.08,
  });

  ctx.restore();

  // Hardware orientation angle (slider -> clasp)
  const n3 = nodes[3];
  const n7 = nodes[7];
  const n8 = nodes[8];
  const n9 = nodes[9];
  const crimpAngle = Math.atan2(n7.y - n3.y, n7.x - n3.x) - Math.PI / 2;
  const claspAngle = Math.atan2(n9.y - n8.y, n9.x - n8.x) - Math.PI / 2;

  // 1. Brushed chrome crimp / slider bead at V-convergence (node 3)
  ctx.save();
  ctx.translate(n3.x, n3.y);
  ctx.rotate(crimpAngle);
  const crimpW = 19 * scale;
  const crimpH = 22 * scale;
  const crimpGrad = ctx.createLinearGradient(-crimpW / 2, 0, crimpW / 2, 0);
  crimpGrad.addColorStop(0, '#c8c8d1');
  crimpGrad.addColorStop(0.28, '#f6f6fa');
  crimpGrad.addColorStop(0.55, '#a1a1ad');
  crimpGrad.addColorStop(0.82, '#e4e4ec');
  crimpGrad.addColorStop(1, '#8c8c97');

  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 3 * scale;
  ctx.fillStyle = crimpGrad;
  ctx.strokeStyle = '#6c6c75';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -crimpW / 2, -crimpH * 0.45, crimpW, crimpH, 5 * scale);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Center brushed highlight line
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-crimpW * 0.34, -crimpH * 0.12);
  ctx.lineTo(crimpW * 0.34, -crimpH * 0.12);
  ctx.stroke();
  ctx.restore();

  // 2. Chrome swivel eyelet + lobster claw clasp hooking into slot (node 8 -> node 9)
  ctx.save();
  ctx.translate(n8.x, n8.y);
  ctx.rotate(claspAngle);

  const linkDist = Math.hypot(n9.x - n8.x, n9.y - n8.y);
  const ringR = 5.2 * scale;

  // Swivel D-ring collar
  const metalGrad = ctx.createLinearGradient(-9 * scale, 0, 9 * scale, 0);
  metalGrad.addColorStop(0, '#a3a3ae');
  metalGrad.addColorStop(0.35, '#f8f8fb');
  metalGrad.addColorStop(0.7, '#9999a4');
  metalGrad.addColorStop(1, '#d8d8e0');

  ctx.fillStyle = metalGrad;
  ctx.strokeStyle = '#5c5c64';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -6.5 * scale, -4 * scale, 13 * scale, 7 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();

  // Clasp stem
  ctx.fillStyle = metalGrad;
  drawRoundedRect(
    ctx,
    -3.2 * scale,
    3 * scale,
    6.4 * scale,
    Math.max(10, linkDist * 0.65),
    3 * scale
  );
  ctx.fill();
  ctx.stroke();

  // Hook jaw snapping into the card slot
  ctx.beginPath();
  ctx.strokeStyle = '#d4d4dc';
  ctx.lineWidth = 2.6 * scale;
  ctx.lineCap = 'round';
  ctx.arc(0, linkDist - 1.5 * scale, ringR, -Math.PI * 0.8, Math.PI * 0.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(82,82,91,0.75)';
  ctx.lineWidth = 1 * scale;
  ctx.arc(0, linkDist - 1.5 * scale, ringR + 1.1 * scale, -Math.PI * 0.75, Math.PI * 0.85);
  ctx.stroke();
  ctx.restore();
}

/**
 * Generates deterministic subtle star dust arranged gently along V-rays behind the lanyard.
 */
export function createAmbientStars(count = 72): AmbientStar[] {
  const stars: AmbientStar[] = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const arm = i % 3;
    const t = 0.08 + rand() * 0.86;
    let xFrac = 0.5;
    let yFrac = t * 0.55;

    if (arm === 0) {
      xFrac = 0.5 - t * 0.34 + (rand() - 0.5) * 0.025;
      yFrac = 0.04 + t * 0.42 + (rand() - 0.5) * 0.02;
    } else if (arm === 1) {
      xFrac = 0.5 + t * 0.34 + (rand() - 0.5) * 0.025;
      yFrac = 0.04 + t * 0.42 + (rand() - 0.5) * 0.02;
    } else {
      xFrac = 0.1 + rand() * 0.8;
      yFrac = 0.05 + rand() * 0.65;
    }

    stars.push({
      xFrac,
      yFrac,
      size: 0.7 + rand() * 1.15,
      alpha: 0.14 + rand() * 0.34,
      phase: rand() * Math.PI * 2,
      speed: 0.4 + rand() * 0.8,
    });
  }
  return stars;
}

/**
 * Renders subtle ambient dust particles radiating behind the hanging badge.
 */
export function renderAmbientStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stars: AmbientStar[],
  timeSec: number,
  isDark: boolean,
  reducedMotion: boolean
) {
  ctx.clearRect(0, 0, width, height);
  const rgb = isDark ? '255,255,255' : '24,24,27';

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const twinkle = reducedMotion
      ? 1
      : 0.65 + 0.35 * Math.sin(timeSec * s.speed + s.phase);
    const a = (s.alpha * twinkle * (isDark ? 1 : 0.45)).toFixed(3);
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath();
    ctx.arc(s.xFrac * width, s.yFrac * height, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
