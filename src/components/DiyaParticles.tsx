import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityChange: number;
  color: string;
}

export const DiyaParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(245, 158, 11, ', // Amber gold
      'rgba(251, 191, 36, ', // Warm yellow
      'rgba(249, 115, 22, ', // Sacred orange / flame
      'rgba(253, 230, 138, ', // Light cream gold
    ];

    const particleCount = prefersReducedMotion ? 15 : Math.min(65, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.8 + 0.8,
        speedX: (Math.random() - 0.5) * (prefersReducedMotion ? 0.05 : 0.35),
        speedY: -Math.random() * (prefersReducedMotion ? 0.1 : 0.5) - 0.1, // Float gently upwards
        opacity: Math.random() * 0.7 + 0.2,
        opacityChange: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric warmth in center-bottom
      const radialGlow = ctx.createRadialGradient(
        width / 2,
        height * 0.9,
        50,
        width / 2,
        height * 0.9,
        Math.max(width, height) * 0.6
      );
      radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
      radialGlow.addColorStop(0.5, 'rgba(120, 53, 15, 0.02)');
      radialGlow.addColorStop(1, 'rgba(6, 3, 12, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render glowing embers
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityChange;

        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.opacityChange = -p.opacityChange;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(1, p.opacity))})`;
        ctx.shadowBlur = p.size * 5;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
