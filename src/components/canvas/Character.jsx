import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useCharacterController } from '../../hooks/useCharacterController';
import { useThirdPersonCamera } from '../../hooks/useThirdPersonCamera';

export function Character() {
  const group = useRef();
  const rb = useRef();
  
  // Load Models and Animations
  const { scene } = useGLTF('/models/Breathing_Idle.glb');
  const { animations: idleAnims } = useGLTF('/models/Breathing_Idle.glb');
  const { animations: walkAnims } = useGLTF('/models/walking.glb');
  const { animations: runAnims }  = useGLTF('/models/running.glb');
  const { animations: jumpAnims } = useGLTF('/models/jumping.glb');

  // Combine and rename animations
  const animations = useMemo(() => {
    const all = [];
    
    const addCtx = (anims, name) => {
        if (anims && anims.length > 0) {
            const clip = anims[0].clone();
            clip.name = name;
            
            const cleanTracks = [];
            clip.tracks.forEach((track) => {
                const isHipsPosition = (track.name.includes("Hips") || track.name.includes("Root")) && track.name.endsWith(".position");
                if (!isHipsPosition) {
                    cleanTracks.push(track);
                }
            });
            clip.tracks = cleanTracks;
            all.push(clip);
        }
    };

    addCtx(idleAnims, "idle");
    addCtx(walkAnims, "walk");
    addCtx(runAnims, "run");
    addCtx(jumpAnims, "jump");
    
    return all;
  }, [idleAnims, walkAnims, runAnims, jumpAnims]);

  const { actions, mixer } = useAnimations(animations, group);

  // Camera Helper
  // Target the Group (visual) so we can get standard Object3D properties like getWorldPosition().
  // Using RigidBody ref directly fails because it doesn't have a standard .position property.
  const { yaw } = useThirdPersonCamera({ target: group });

  // Controller Logic
  useCharacterController({
    animations: { actions, mixer },
    rigidBody: rb,
    group, // For rotation
    getCameraYaw: () => yaw.current
  });

  useEffect(() => {
    scene.traverse((child) => {
       if (child.isMesh) {
           child.castShadow = true;
           child.receiveShadow = true;
           child.frustumCulled = false;
       }
    });
  }, [scene]);

  return (
    <RigidBody 
      ref={rb} 
      colliders={false} 
      lockRotations 
      position={[0, 1, 0]} 
      friction={1} // prevent sliding when stopped
    >
      <CapsuleCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
      
      <group ref={group} dispose={null}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
}

// Preload to avoid pop-in
useGLTF.preload('/models/Breathing_Idle.glb');
useGLTF.preload('/models/walking.glb');
useGLTF.preload('/models/running.glb');
useGLTF.preload('/models/jumping.glb');
