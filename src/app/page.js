'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { InputProvider } from '../context/InputContext';
import MobileControls from '../components/ui/MobileControls';

const Scene = dynamic(() => import('../components/canvas/Scene'), { ssr: false });

export default function Home() {
  const [isIntro, setIsIntro] = useState(true);

  return (
    <InputProvider>
      <div className="relative h-screen w-full bg-black text-white">
        <div className="absolute inset-0">
          <Scene isIntro={isIntro} onStart={() => setIsIntro(false)} />
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 lg:p-8 text-center text-xs md:text-sm tracking-wide uppercase text-white/85">
          <p>WASD / Arrows to Move · Shift to Run · Drag Mouse to Look</p>
          <p className="text-[10px] md:text-xs text-white/60">boy.glb · R3F Controller Demo</p>
        </div>
        <MobileControls visible={!isIntro} />
      </div>
    </InputProvider>
  );
}
