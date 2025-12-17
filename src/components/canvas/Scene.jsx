'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Experience } from './Experience';
import { Suspense } from 'react';

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 5], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a1b20']} />
      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          <Experience />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
