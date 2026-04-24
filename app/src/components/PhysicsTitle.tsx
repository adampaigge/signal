import { useEffect, useRef, useCallback } from 'react';

interface Props {
  text?: string;
  fontSize?: number;
  /** Y position of letter rest positions in px (default 65 — centre of masthead) */
  restY?: number;
  onWhip?: () => void;
}

interface Letter {
  ch: string;
  w: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number; // rest X
  oy: number; // rest Y
}

const SUBSTEPS    = 8;
const GAP_SCALE   = 0.18;
const SPRING_K    = 0.5;
const DAMPING     = 0.993;
const CENTER_PULL = 0.0008;
const HIT_RADIUS  = 36;

export default function PhysicsTitle({ text = 'THE SIGNAL', fontSize = 52, restY = 65, onWhip }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const letters     = useRef<Letter[]>([]);
  const restDists   = useRef<number[]>([]);
  const grabbed     = useRef<number | null>(null);
  const lastPos     = useRef({ x: 0, y: 0 });
  const grabVel     = useRef({ vx: 0, vy: 0 });
  const rafRef      = useRef<number>(0);
  const dpr         = useRef(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const D = dpr.current;
    const fs = fontSize * D;

    ctx.font = `800 ${fs}px "Newsreader", Georgia, serif`;
    const chars = text.split('');
    const meas  = chars.map(ch => ({ ch, w: ctx.measureText(ch).width }));
    const gap   = fs * GAP_SCALE;
    const W  = canvas.width;
    let cx   = (W - meas.reduce((s, m) => s + m.w, 0) - gap * (meas.length - 1)) / 2;
    const cy = restY * dpr.current;

    letters.current = meas.map(m => {
      const x = cx + m.w / 2;
      cx += m.w + gap;
      return { ch: m.ch, w: m.w, x, y: cy, vx: 0, vy: 0, ox: x, oy: cy };
    });

    restDists.current = [];
    for (let i = 0; i < letters.current.length - 1; i++) {
      const a = letters.current[i], b = letters.current[i + 1];
      const dx = b.ox - a.ox, dy = b.oy - a.oy;
      restDists.current.push(Math.sqrt(dx * dx + dy * dy));
    }
  }, [text, fontSize]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const D = dpr.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * D;
    canvas.height = rect.height * D;
    init();
  }, [init]);

  const step = useCallback(() => {
    const ls  = letters.current;
    const rds = restDists.current;
    const gr  = grabbed.current;
    const DT  = 1 / SUBSTEPS;

    for (let s = 0; s < SUBSTEPS; s++) {
      for (let i = 0; i < ls.length; i++) {
        const l = ls[i];
        if (gr === i) continue;

        l.vx += (l.ox - l.x) * CENTER_PULL;
        l.vy += (l.oy - l.y) * CENTER_PULL;

        if (i > 0) {
          const n = ls[i - 1];
          const dx = l.x - n.x, dy = l.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const stretch = dist - rds[i - 1];
          const fx = (dx / dist) * stretch * SPRING_K * DT;
          const fy = (dy / dist) * stretch * SPRING_K * DT;
          l.vx -= fx; l.vy -= fy;
          if (gr !== i - 1) { n.vx += fx; n.vy += fy; }
        }

        if (i < ls.length - 1) {
          const n = ls[i + 1];
          const dx = l.x - n.x, dy = l.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const stretch = dist - rds[i];
          const fx = (dx / dist) * stretch * SPRING_K * DT;
          const fy = (dy / dist) * stretch * SPRING_K * DT;
          l.vx -= fx; l.vy -= fy;
          if (gr !== i + 1) { n.vx += fx; n.vy += fy; }
        }

        l.vx *= DAMPING; l.vy *= DAMPING;
        l.x  += l.vx;   l.y  += l.vy;
      }
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const D   = dpr.current;
    const ls  = letters.current;
    const rds = restDists.current;
    const fs  = fontSize * D;
    const gr  = grabbed.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font          = `800 ${fs}px "Newsreader", Georgia, serif`;
    ctx.textBaseline  = 'middle';
    ctx.textAlign     = 'center';

    // Spring lines
    ctx.lineWidth = 1 * D;
    for (let i = 0; i < ls.length - 1; i++) {
      const a = ls[i], b = ls[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const rest  = rds[i];
      const strain = Math.min(Math.abs(dist - rest) / rest, 1);
      ctx.strokeStyle = `rgba(232,97,26,${0.06 + strain * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Build gradient across full letter span for rest positions
    const firstOx = ls[0]?.ox ?? 0;
    const lastOx  = ls[ls.length - 1]?.ox ?? W;
    const grad = ctx.createLinearGradient(firstOx - 20, 0, lastOx + 20, 0);
    grad.addColorStop(0,    '#6baee8');
    grad.addColorStop(0.55, '#dde1ec');
    grad.addColorStop(1,    '#c84a0c');

    // Letters
    for (let i = 0; i < ls.length; i++) {
      const l       = ls[i];
      const isGrab  = gr === i;
      const speed   = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      const glow    = Math.min(speed * 0.05, 1);

      ctx.shadowColor = isGrab ? '#e8611a' : '#4f8ef7';
      ctx.shadowBlur  = isGrab
        ? 24 * D
        : glow > 0.05 ? glow * 20 * D : 0;

      // Grabbed letter burns orange, others use the gradient
      ctx.fillStyle = isGrab ? '#e8611a' : grad;
      ctx.globalAlpha = isGrab ? 1 : 0.85 + glow * 0.15;
      ctx.fillText(l.ch, l.x, l.y);
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    }
  }, [fontSize]);

  const loop = useCallback(() => {
    step();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [step, draw]);

  // ── Pointer helpers ──────────────────────────────────────────
  const getXY = (e: MouseEvent | Touch): [number, number] => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const D      = dpr.current;
    return [(e.clientX - rect.left) * D, (e.clientY - rect.top) * D];
  };

  const findLetter = (mx: number, my: number): number | null => {
    const hitR = HIT_RADIUS * dpr.current;
    for (let i = 0; i < letters.current.length; i++) {
      const l  = letters.current[i];
      const dx = mx - l.x, dy = my - l.y;
      if (Math.sqrt(dx * dx + dy * dy) < hitR) return i;
    }
    return null;
  };

  const onDown = useCallback((mx: number, my: number) => {
    const idx = findLetter(mx, my);
    if (idx !== null) {
      grabbed.current = idx;
      grabVel.current = { vx: 0, vy: 0 };
      lastPos.current = { x: mx, y: my };
    }
  }, []);

  const onMove = useCallback((mx: number, my: number) => {
    if (grabbed.current === null) return;
    const vx = mx - lastPos.current.x;
    const vy = my - lastPos.current.y;
    grabVel.current = { vx, vy };
    letters.current[grabbed.current].x  = mx;
    letters.current[grabbed.current].y  = my;
    letters.current[grabbed.current].vx = vx;
    letters.current[grabbed.current].vy = vy;
    lastPos.current = { x: mx, y: my };
  }, []);

  const onUp = useCallback(() => {
    if (grabbed.current !== null) {
      letters.current[grabbed.current].vx = grabVel.current.vx;
      letters.current[grabbed.current].vy = grabVel.current.vy;
      grabbed.current = null;
      onWhip?.();
    }
  }, [onWhip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resize();
    loop();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      resize();
      loop();
    });
    ro.observe(canvas);

    // Mouse
    const md = (e: MouseEvent) => { const [x, y] = getXY(e); onDown(x, y); };
    const mm = (e: MouseEvent) => { const [x, y] = getXY(e); onMove(x, y); };
    const mu = () => onUp();

    // Touch
    const td = (e: TouchEvent) => { e.preventDefault(); const [x, y] = getXY(e.touches[0]); onDown(x, y); };
    const tm = (e: TouchEvent) => { e.preventDefault(); const [x, y] = getXY(e.touches[0]); onMove(x, y); };
    const tu = () => onUp();

    canvas.addEventListener('mousedown',  md);
    window.addEventListener('mousemove',  mm);
    window.addEventListener('mouseup',    mu);
    canvas.addEventListener('touchstart', td, { passive: false });
    canvas.addEventListener('touchmove',  tm, { passive: false });
    canvas.addEventListener('touchend',   tu);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown',  md);
      window.removeEventListener('mousemove',  mm);
      window.removeEventListener('mouseup',    mu);
      canvas.removeEventListener('touchstart', td);
      canvas.removeEventListener('touchmove',  tm);
      canvas.removeEventListener('touchend',   tu);
    };
  }, [resize, loop, onDown, onMove, onUp]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
    />
  );
}
