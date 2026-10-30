import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Copy, Download, Sparkles, Check, Code2 } from 'lucide-react';

const TEMPLATES: Record<string, string> = {
  counter: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0f172a;
      color: #f8fafc;
    }
    .card {
      background: #1e293b;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      text-align: center;
      border: 1px solid #334155;
    }
    .count {
      font-size: 56px;
      font-weight: 800;
      color: #38bdf8;
      margin: 16px 0;
      font-family: monospace;
    }
    .btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      margin: 0 6px;
      transition: transform 0.1s;
    }
    .btn:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <div class="card">
    <h2>Interactive Counter</h2>
    <div class="count" id="count">0</div>
    <div>
      <button class="btn" onclick="inc(-1)">- Decrement</button>
      <button class="btn" onclick="inc(1)">+ Increment</button>
    </div>
  </div>
  <script>
    let n = 0;
    function inc(val) {
      n += val;
      document.getElementById('count').innerText = n;
    }
  </script>
</body>
</html>`,
  canvas: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: #05050b; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for(let i=0; i<60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        hue: Math.random() * 360
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(5, 5, 11, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(' + p.hue + ', 90%, 65%)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`,
  clock: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #020617;
      color: #e2e8f0;
      font-family: -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .clock {
      font-family: monospace;
      font-size: 64px;
      font-weight: 700;
      color: #10b981;
      background: #0f172a;
      padding: 24px 48px;
      border-radius: 20px;
      border: 1px solid #1e293b;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
    }
  </style>
</head>
<body>
  <div class="clock" id="clock">00:00:00</div>
  <script>
    function tick() {
      const now = new Date();
      document.getElementById('clock').innerText = now.toLocaleTimeString();
    }
    setInterval(tick, 1000);
    tick();
  </script>
</body>
</html>`
};

export const ScratchpadPage: React.FC = () => {
  const [code, setCode] = useState(TEMPLATES.counter);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runCode = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code;
    }
  };

  useEffect(() => {
    runCode();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scratchpad.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 select-text">
      {/* Top Action Bar */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-white">Dev Scratchpad</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">Live HTML/CSS/JS Sandbox</span>
        </div>

        {/* Template Selectors & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => { setCode(TEMPLATES.counter); setTimeout(runCode, 50); }}
              className="px-2 py-1 rounded text-slate-300 hover:text-white"
            >
              Counter
            </button>
            <button
              onClick={() => { setCode(TEMPLATES.canvas); setTimeout(runCode, 50); }}
              className="px-2 py-1 rounded text-slate-300 hover:text-white"
            >
              Canvas
            </button>
            <button
              onClick={() => { setCode(TEMPLATES.clock); setTimeout(runCode, 50); }}
              className="px-2 py-1 rounded text-slate-300 hover:text-white"
            >
              Clock
            </button>
          </div>

          <button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Download .html file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Code Editor Pane */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950">
          <div className="px-3 py-1 bg-slate-900/40 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>index.html</span>
            <span>UTF-8</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {/* Live Preview Pane */}
        <div className="flex-1 flex flex-col bg-slate-900">
          <div className="px-3 py-1 bg-slate-900/40 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Rendered Output Preview</span>
            <span className="text-emerald-400">● live</span>
          </div>
          <iframe
            ref={iframeRef}
            title="Scratchpad Output"
            sandbox="allow-scripts allow-modals"
            className="w-full flex-1 border-none bg-slate-950"
          />
        </div>
      </div>
    </div>
  );
};
