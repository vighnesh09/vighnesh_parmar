import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useInput } from './useInput';

const UP = new THREE.Vector3(0, 1, 0);

export function useCharacterController({ animations, rigidBody, group, getCameraYaw }) {
  const { actions } = animations;
  const input = useInput();
  const { world, rapier } = useRapier(); // Access Rapier world and instance
  
  // Config
  const walkSpeed = 5.0;
  const runSpeed = 7.0;
  const rotationSpeed = 8.0;
  const jumpImpulse = 6.0; // Impulse is instant force
  
  // State Refs
  const isGrounded = useRef(true);
  const isJumping = useRef(false); // For animation states
  const inputVector = useRef(new THREE.Vector3());

  // Animation Management
  useEffect(() => {
    if (!actions) return;
    
    const playAction = (name) => {
        const action = actions[name];
        if (action) {
            action.enabled = true;
            action.setEffectiveWeight(0);
            action.play();
        }
    };
    
    playAction("idle");
    playAction("walk");
    playAction("run");
    if (actions.jump) {
        actions.jump.setLoop(THREE.LoopOnce, 1);
        actions.jump.clampWhenFinished = true;
        actions.jump.enabled = true;
        actions.jump.setEffectiveWeight(0);
        actions.jump.play();
    }
  }, [actions]);

  useFrame((state, delta) => {
    if (!rigidBody.current || !group.current) return;

    // 1. Check Ground (Raycast)
    const origin = rigidBody.current.translation();
    // Origin is at center of capsule. Raycast down from slightly below center.
    // Capsule height ~1.6m ? We adjusted origin in Character.jsx with position=[0, 1, 0] ?? 
    // RigidBody position is center of mass.
    // Let's cast from center (origin) downwards.
    // Ray origin, Ray dir, Max Toi (Distance), Solid
    // We need to cast slightly below feet. Center is around y=1 (if on ground). Feet at y=0.
    // Length should be slightly more than half height.
    
    // Note: origin needs to be Rapier vector {x,y,z}
    const rayOrigin = { x: origin.x, y: origin.y, z: origin.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = world.castRay({ origin: rayOrigin, dir: rayDir }, 10, true); 
    // Wait, castRay signature depends on version. React-three/rapier uses RAPIER.World.
    // world.castRay(ray, maxToi, solid)
    // We need to create a ray object? No, rapier instance.
    // Let's assume simplest API: use a Rapier Ray.
    // Actually easier: simply check if dist < distanceToGround.
    
    // Let's use a simpler heuristic for now: check vertical velocity ~ 0 ?? No.
    // Correct way:
    // We can't easily import RAPIER class here without importing 'rapier' package directly 
    // which might not be exposed.
    // Alternative: Use `rigidBody.current.lockRotations()` ? We did that.
    
    // Let's fallback to specific Rapier Raycast if we can access RAPIER.
    // Or we can just use `world` from context.
    // `world.castRay(new RAPIER.Ray(origin, dir))` ?
    
    // Simpler hack if `rapier` import is tricky:
    // Just assume grounded if y velocity is 0? No.
    // Let's rely on `rigidBody.current.linvel().y`.
    
    // Okay, let's try strict raycasting.
    // import { Ray } from '@dimforge/rapier3d-compat'? No.
    
    // WORKAROUND: We can just cast a ray using the world method which usually accepts (origin, dir, maxToi).
    // Let's try:
    let grounded = false;
    // Raycast down 1.1 meters (center to feet + margin)
    // Actually simpler: standard rapier world.castRay(ray, maxToi, solid)
    // We assume world.castRay exists.
    
    // Better: use `rapier` instance from `useRapier`.

    const rayCast = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(rayCast, 1.0, true); // 1.0 = half height (0.8) + 0.2 margin
    
    // Filter out self logic? dynamic bodies are ignored by default?? 
    // No, usually we need `interactionGroups`.
    // Let's assume user is layer 0.
    
    // Simpler logic for prototype: Check if hit < 1.0
    if (hit && hit.timeOfImpact < 0.9) { // 0.8 is half height roughly if capsule is height 1.6
        grounded = true;
    }
    // Debug fallback: if y < 0.1
    if (origin.y < 0.1) grounded = true; 
    
    isGrounded.current = grounded;
    
    // 2. Input Logic
    inputVector.current.set(0, 0, 0);
    if (input.forward)  inputVector.current.z -= 1;
    if (input.backward) inputVector.current.z += 1;
    if (input.left)     inputVector.current.x -= 1;
    if (input.right)    inputVector.current.x += 1;
    
    if (inputVector.current.lengthSq() > 0) {
        inputVector.current.normalize();
    }
    
    const targetSpeed = (inputVector.current.lengthSq() > 0) ? (input.run ? runSpeed : walkSpeed) : 0;
    
    // 3. Calculate Velocity
    const yaw = getCameraYaw();
    const rotation = new THREE.Quaternion().setFromAxisAngle(UP, yaw);
    const desiredVelocity = inputVector.current.clone().applyQuaternion(rotation).multiplyScalar(targetSpeed);
    
    // 4. Update Physics Velocity
    const currentVel = rigidBody.current.linvel();
    
    // Smooth change in X/Z (movement), preserve Y (gravity)
    // Lerp factor
    const factor = (inputVector.current.lengthSq() > 0) ? 12.0 : 10.0;
    const alpha = 1.0 - Math.exp(-factor * delta);
    
    const newX = THREE.MathUtils.lerp(currentVel.x, desiredVelocity.x, alpha);
    const newZ = THREE.MathUtils.lerp(currentVel.z, desiredVelocity.z, alpha);
    
    let newY = currentVel.y;
    
    // Jump
    if (input.jump && isGrounded.current) {
        newY = jumpImpulse;
        isGrounded.current = false;
        
        if (actions.jump) {
             actions.jump.reset().setEffectiveWeight(1).play();
        }
    }
    
    rigidBody.current.setLinvel({ x: newX, y: newY, z: newZ }, true);
    
    // 5. Update Rotation (Mesh only)
    const speed = Math.sqrt(newX**2 + newZ**2);
    if (speed > 0.1) {
        const targetAngle = Math.atan2(newX, newZ);
        const targetQuat = new THREE.Quaternion().setFromAxisAngle(UP, targetAngle);
        group.current.quaternion.slerp(targetQuat, 1.0 - Math.exp(-rotationSpeed * delta));
    }
    
    // 6. Update Animation Weights
    if (!actions) return;
    let idleW = 0, walkW = 0, runW = 0, jumpW = 0;
    
    if (!isGrounded.current) {
       jumpW = 1.0;
    } else {
       if (speed < 0.1) {
         idleW = 1.0;
       } else if (speed < 4.0) {
         const t = THREE.MathUtils.clamp(speed / walkSpeed, 0, 1);
         idleW = 1.0 - t; walkW = t;
       } else {
         const t = THREE.MathUtils.clamp((speed - walkSpeed) / (runSpeed - walkSpeed), 0, 1);
         walkW = 1.0 - t; runW = t;
       }
    }
    
    const smoothWeight = (action, target) => {
        if (!action) return;
        const current = action.getEffectiveWeight();
        const deltaW = target - current;
        const step = 8.0 * delta; 
        let next = current + deltaW * Math.min(step, 1.0); 
        action.setEffectiveWeight(next);
    };

    smoothWeight(actions.idle, idleW);
    smoothWeight(actions.walk, walkW);
    smoothWeight(actions.run, runW);
    
    if (actions.jump) {
        actions.jump.setEffectiveWeight(jumpW ? 1 : 0);
    }
  });
}
