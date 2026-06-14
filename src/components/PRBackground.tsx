"use client";
import { useEffect, useRef } from "react";

/* ── Floating symbol definitions ── */
const SYMBOLS = [
  { s: "🤖", x: 8,  y: 12, size: 22, dur: 9  },
  { s: "📊", x: 18, y: 70, size: 18, dur: 13 },
  { s: "💬", x: 30, y: 30, size: 20, dur: 11 },
  { s: "📡", x: 55, y: 80, size: 22, dur: 14 },
  { s: "⚡", x: 72, y: 15, size: 18, dur: 8  },
  { s: "🔗", x: 85, y: 60, size: 20, dur: 12 },
  { s: "📈", x: 90, y: 85, size: 18, dur: 10 },
  { s: "🧠", x: 44, y: 55, size: 22, dur: 15 },
  { s: "🎯", x: 65, y: 40, size: 18, dur: 11 },
  { s: "🔍", x: 10, y: 50, size: 16, dur: 13 },
  { s: "📰", x: 78, y: 28, size: 18, dur: 9  },
  { s: "💡", x: 38, y: 88, size: 20, dur: 12 },
];

/* ── SVG network nodes ── */
const NODES = [
  { cx: 120, cy: 100 }, { cx: 300, cy: 60  }, { cx: 500, cy: 130 },
  { cx: 680, cy: 80  }, { cx: 850, cy: 150 }, { cx: 200, cy: 300 },
  { cx: 420, cy: 280 }, { cx: 620, cy: 320 }, { cx: 820, cy: 260 },
  { cx: 100, cy: 450 }, { cx: 350, cy: 420 }, { cx: 560, cy: 480 },
  { cx: 750, cy: 400 }, { cx: 950, cy: 350 },
];

const EDGES = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,6],[3,7],[4,8],
  [5,6],[6,7],[7,8],[5,9],[6,10],[7,11],[8,12],[9,10],[10,11],[11,12],[12,13],[8,13],
];

export default function PRBackground({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Canvas particle stream ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = dark
              ? `rgba(45,139,186,${0.15 * (1 - dist / 120)})`
              : `rgba(30,111,160,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(34,199,120,${p.alpha})`
          : `rgba(22,168,96,${p.alpha})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [dark]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>

      {/* ── Gradient orbs ── */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        top: "-10%", right: "-5%",
        background: dark
          ? "radial-gradient(circle, rgba(45,139,186,0.12) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(30,111,160,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500,
        bottom: "10%", left: "-8%",
        background: dark
          ? "radial-gradient(circle, rgba(34,199,120,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(22,168,96,0.07) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400,
        top: "40%", left: "40%",
        background: dark
          ? "radial-gradient(circle, rgba(107,158,144,0.07) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(107,158,144,0.05) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* ── Canvas particles & lines ── */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, opacity: 0.8 }} />

      {/* ── SVG neural network ── */}
      <svg
        viewBox="0 0 1100 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: dark ? 0.18 : 0.1 }}
      >
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d8bba" />
            <stop offset="100%" stopColor="#22c778" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* edges */}
        {EDGES.map(([a, b], i) => (
          <line key={i}
            x1={NODES[a].cx} y1={NODES[a].cy}
            x2={NODES[b].cx} y2={NODES[b].cy}
            stroke="url(#edgeGrad)" strokeWidth="1"
            opacity="0.6"
          />
        ))}
        {/* nodes */}
        {NODES.map((n, i) => (
          <g key={i} filter="url(#glow)">
            <circle cx={n.cx} cy={n.cy} r="5" fill="#22c778" opacity="0.9" />
            <circle cx={n.cx} cy={n.cy} r="10" fill="none" stroke="#2d8bba" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" values="10;15;10" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      {/* ── Floating PR/AI symbols ── */}
      {SYMBOLS.map((sym, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${sym.x}%`,
          top: `${sym.y}%`,
          fontSize: sym.size,
          opacity: dark ? 0.12 : 0.08,
          animation: `prFloat${i % 3} ${sym.dur}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
          userSelect: "none",
        }}>
          {sym.s}
        </div>
      ))}

      {/* ── Geometric grid lines ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: dark ? 0.04 : 0.03 }}
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={`${i * 5.26}%`} y1="0" x2={`${i * 5.26}%`} y2="100%"
            stroke="#2d8bba" strokeWidth="1" />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 6.67}%`} x2="100%" y2={`${i * 6.67}%`}
            stroke="#22c778" strokeWidth="1" />
        ))}
      </svg>

      {/* ── Hexagon decorations ── */}
      <svg style={{ position: "absolute", top: "15%", right: "8%", opacity: dark ? 0.08 : 0.05, width: 120, height: 120 }} viewBox="0 0 100 100">
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="#2d8bba" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="25s" repeatCount="indefinite" />
        </polygon>
        <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" fill="none" stroke="#22c778" strokeWidth="1">
          <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="18s" repeatCount="indefinite" />
        </polygon>
      </svg>

      <svg style={{ position: "absolute", bottom: "20%", left: "5%", opacity: dark ? 0.07 : 0.05, width: 90, height: 90 }} viewBox="0 0 100 100">
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="#22c778" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
        </polygon>
      </svg>

      {/* ── Data flow animated dashes ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: dark ? 0.12 : 0.07 }}>
        <path d="M 0 200 Q 300 100 600 250 T 1200 200" fill="none" stroke="#2d8bba" strokeWidth="1.5" strokeDasharray="8 12">
          <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="6s" repeatCount="indefinite" />
        </path>
        <path d="M 0 500 Q 400 380 800 480 T 1400 400" fill="none" stroke="#22c778" strokeWidth="1.5" strokeDasharray="6 14">
          <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="9s" repeatCount="indefinite" />
        </path>
        <path d="M 200 0 Q 350 300 250 600" fill="none" stroke="#6b9e90" strokeWidth="1" strokeDasharray="4 10">
          <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="7s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* ── Keyframes injected via style tag ── */}
      <style>{`
        @keyframes prFloat0 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes prFloat1 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(-5deg); }
        }
        @keyframes prFloat2 {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-22px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
