'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Experience } from './Experience';
import { Suspense, useState } from 'react';
import IntroOverlay from '../ui/IntroOverlay';

export default function Scene({ isIntro, onStart }) {
  // const [isIntro, setIsIntro] = useState(true); // State lifted to page.js

  return (
    <>
      {isIntro && <IntroOverlay onStart={onStart} />}
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <color attach="background" args={['#1a1b20']} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Experience isIntro={isIntro} />
          </Physics>
        </Suspense>
      </Canvas>
    </>
  );
}
