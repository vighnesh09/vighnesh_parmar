import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { Character } from './Character';

export function Experience() {
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

      <RigidBody type="fixed" colliders="hull">
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color={0x3b3b3e} />
        </mesh>
      </RigidBody>

      <EnvironmentObjects />
      <Character />
    </>
  );
}

function EnvironmentObjects() {
  const objects = useMemo(() => {
    const geoms = [];
    const colors = [0x888888, 0x444444, 0x666666];

    for (let i = 0; i < 20; i++) {
      geoms.push({
        position: [(Math.random() - 0.5) * 100, 1, (Math.random() - 0.5) * 100],
        type: Math.random() > 0.5 ? 'box' : 'cylinder',
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return geoms;
  }, []);

  return (
    <>
      {objects.map((obj, i) => (
        <RigidBody key={i} position={obj.position} type="fixed" colliders="hull">
          <mesh castShadow receiveShadow>
              {obj.type === 'box' ? <boxGeometry args={[2, 2, 2]} /> : <cylinderGeometry args={[1, 1, 3, 16]} />}
              <meshStandardMaterial color={obj.color} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
