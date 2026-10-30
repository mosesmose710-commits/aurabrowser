import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleAngle: number;
  wobbleDist: number;
  hue: number;
  opacity: number;
}

interface MosestechTheorySplashProps {
  onComplete: () => void;
  durationMs?: number; // default ~4800ms
}

export const MosestechTheorySplash: React.FC<MosestechTheorySplashProps> = ({
  onComplete,
  durationMs = 4600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Show text after brief initial breath
    const textTimer = setTimeout(() => {
      setTextVisible(true);
    }, 400);

    // Start fadeout
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, durationMs - 800);

    // Complete transition
    const endTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [durationMs, onComplete]);

  // Canvas Bubble Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 35 beautiful iridescent bubbles
    const bubbles: Bubble[] = [];
    const count = Math.min(45, Math.floor(width / 35));

    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height + height * 0.2,
        radius: 12 + Math.random() * 42,
        speedY: 0.8 + Math.random() * 1.6,
        speedX: (Math.random() - 0.5) * 0.6,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleAngle: Math.random() * Math.PI * 2,
        wobbleDist: 15 + Math.random() * 25,
        hue: 190 + Math.random() * 90, // Cyan, Indigo, Violet, Emerald
        opacity: 0.35 + Math.random() * 0.45,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient background light
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        width * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGrad.addColorStop(0.5, 'rgba(3, 7, 18, 0.98)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update & Draw Bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.wobbleAngle += b.wobbleSpeed;
        const currentX = b.x + Math.sin(b.wobbleAngle) * b.wobbleDist;
        b.y -= b.speedY;

        // Gentle cursor avoidance
        const dx = currentX - mouseX;
        const dy = b.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          b.x += (dx / dist) * force * 3;
          b.y += (dy / dist) * force * 3;
        }

        // Wrap around bottom
        if (b.y < -b.radius * 2) {
          b.y = height + b.radius * 2;
          b.x = Math.random() * width;
        }

        // Draw Soap/Glass Bubble with Iridescent Reflection
        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);

        // Bubble body gradient (sheer glass with chromatic edge)
        const bubbleGrad = ctx.createRadialGradient(
          currentX - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          currentX,
          b.y,
          b.radius
        );
        bubbleGrad.addColorStop(0, `hsla(${b.hue}, 90%, 85%, ${b.opacity * 0.3})`);
        bubbleGrad.addColorStop(0.6, `hsla(${b.hue + 30}, 80%, 65%, ${b.opacity * 0.15})`);
        bubbleGrad.addColorStop(0.9, `hsla(${b.hue - 20}, 95%, 70%, ${b.opacity * 0.5})`);
        bubbleGrad.addColorStop(1, `hsla(${b.hue}, 100%, 80%, ${b.opacity * 0.85})`);

        ctx.fillStyle = bubbleGrad;
        ctx.fill();

        // Outer iridescent border ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `hsla(${b.hue}, 90%, 75%, ${b.opacity * 0.7})`;
        ctx.stroke();

        // Primary Specular Reflection Highlight (White crescent on top-left)
        ctx.beginPath();
        ctx.ellipse(
          currentX - b.radius * 0.38,
          b.y - b.radius * 0.38,
          b.radius * 0.3,
          b.radius * 0.16,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.85})`;
        ctx.fill();

        // Secondary bottom soft rim reflection
        ctx.beginPath();
        ctx.arc(currentX + b.radius * 0.3, b.y + b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.hue + 45}, 100%, 80%, ${b.opacity * 0.3})`;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden transition-opacity duration-800 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#030712' }}
    >
      {/* 60fps Canvas with Iridescent Floating Bubbles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Atmospheric Glowing Radial Center Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.18),transparent_65%)] pointer-events-none" />

      {/* Skip Button in Top Right */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50 text-xs font-mono backdrop-blur-md transition-all cursor-pointer shadow-lg group"
      >
        <span>Enter Browser</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Central Typography Showcase */}
      <div
        className={`relative z-10 max-w-3xl w-full text-center px-6 transition-all duration-1000 transform pointer-events-none ${
          textVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Subtle Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-mono font-semibold tracking-widest uppercase mb-4 backdrop-blur-md shadow-sm shadow-indigo-500/10">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>INDEPENDENT WEB ENGINE</span>
        </div>

        {/* Main Title: WELCOME TO XENON */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-2xl">
          WELCOME TO{' '}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            XENON
          </span>
        </h1>

        {/* Subtitle / Philosophy */}
        <p className="text-sm sm:text-base text-slate-300 font-light mt-3 max-w-xl mx-auto leading-relaxed">
          Intelligent web browsing with high-speed engine & Ordion AI co-pilot · Engineered by Moses.
        </p>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Ordion AI Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
