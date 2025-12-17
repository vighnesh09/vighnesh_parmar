'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../components/canvas/Scene'), { ssr: false });

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-black text-white">
      <div className="absolute inset-0">
        <Scene />
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-8 text-center text-sm tracking-wide uppercase text-white/85">
        <p>WASD / Arrows to Move · Shift to Run · Drag Mouse to Look</p>
        <p className="text-xs text-white/60">boy.glb · R3F Controller Demo</p>
      </div>
    </div>
  );
}
