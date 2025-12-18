import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { Character } from './Character';
import { City } from './City';



export function Experience({ isIntro }) {
  return (
    <>
      <hemisphereLight intensity={0.65} color={0xffffff} groundColor={0x4b4b4b} position={[0, 20, 0]} />
      <directionalLight
        position={[-5, 10, -5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15, 0.5, 50]} />
      </directionalLight>
      <ambientLight intensity={0.5} />

      <City />
      <Character isIntro={isIntro} />
    </>
  );
}
