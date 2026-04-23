import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const c = canvas; // stable non-null reference for nested functions

    const PARTICLE_COUNT = 100;
    const CONNECTION_DIST = 200;
    const MOUSE_RADIUS = 200;
    const MOUSE_STRENGTH = 0.2;

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }

    function init() {
      resize();
      particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.4 + 0.2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      const ps = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Update positions
      for (const p of ps) {
        // Mouse repulsion / attraction
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx -= dx / dist * force * MOUSE_STRENGTH;
          p.vy -= dy / dist * force * MOUSE_STRENGTH;
        }

        // Damping
        p.vx *= 0.992;
        p.vy *= 0.992;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
      }

      // Draw connections
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79, 142, 247, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of ps) {
        // Glow near mouse
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glowBoost = dist < MOUSE_RADIUS ? (1 - dist / MOUSE_RADIUS) * 0.6 : 0;
        const alpha = p.opacity + glowBoost;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 142, 247, ${alpha})`;
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    const onResize = () => {
      resize();
    };

    init();
    draw();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
