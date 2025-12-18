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
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold tracking-widest text-white/80 uppercase">
            WASD to Move · Space to Jump
          </p>
        </div>
        <MobileControls visible={!isIntro} />
      </div>
    </InputProvider>
  );
}
