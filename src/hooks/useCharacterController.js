import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useInput } from './useInput';

const UP = new THREE.Vector3(0, 1, 0);

export function useCharacterController({ animations, rigidBody, group, getCameraYaw, isIntro }) {
  const { actions } = animations;
  const input = useInput();
  const { world, rapier } = useRapier(); // Access Rapier world and instance
  
  // Config
  const walkSpeed = 1.6; // ~5.7 km/h - Realistic brisk walk
  const runSpeed = 5.0;  // ~18 km/h - Realistic fit human run
  const rotationSpeed = 6.0; // Smoother turning
  const jumpImpulse = 3.5; // ~0.6m jump height with Earth gravity
  
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

    // --- 1. Ground Detection (Raycast) ---
    const origin = rigidBody.current.translation();
    const rayOrigin = { x: origin.x, y: origin.y, z: origin.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    
    let hit = null;
    // Safe check if rapier instance is available
    if (rapier && world) {
         // Create ray using local rapier instance
         const ray = new rapier.Ray(rayOrigin, rayDir);
         // Cast ray: ray, maxToi, solid
         hit = world.castRay(ray, 1.5, true); 
    }

    // Default to false unless we hit something close
    let grounded = false;
    if (hit && hit.timeOfImpact < 1.0) { // Slight margin over half-height
        grounded = true;
    }
    isGrounded.current = grounded;

    // --- 2. Input Logic ---
    inputVector.current.set(0, 0, 0);
    
    // Disable movement if in intro mode
    if (!isIntro) {
      if (input.forward)  inputVector.current.z -= 1;
      if (input.backward) inputVector.current.z += 1;
      if (input.left)     inputVector.current.x -= 1;
      if (input.right)    inputVector.current.x += 1;

      // Joystick Input
      if (input.joystick) {
        inputVector.current.x += input.joystick.x;
        inputVector.current.z += input.joystick.y;
      }
    }
    
    if (inputVector.current.lengthSq() > 0) {
        inputVector.current.normalize();
    }
    
    const isRunning = input.run;
    const targetSpeed = (inputVector.current.lengthSq() > 0) 
        ? (isRunning ? runSpeed : walkSpeed) 
        : 0;
    
    // --- 3. Orientation & Banking ---
    const yaw = getCameraYaw();
    const camQuat = new THREE.Quaternion().setFromAxisAngle(UP, yaw);
    const moveDir = inputVector.current.clone().applyQuaternion(camQuat);
    
    if (moveDir.lengthSq() > 0.1) {
        const angle = Math.atan2(moveDir.x, moveDir.z);
        const targetQuat = new THREE.Quaternion().setFromAxisAngle(UP, angle);
        
        // Banking Logic (Roll)
        // If we are turning left, roll left slightly.
        const currentQ = group.current.quaternion;
        
        // Slerp main rotation
        group.current.quaternion.slerp(targetQuat, 1.0 - Math.exp(-rotationSpeed * delta));
    }
    
    // --- 4. Physics Velocity Calculation (Inertia & Slopes) ---
    const currentVel = rigidBody.current.linvel();
    
    let finalMoveDir = moveDir.clone();
    
    // Slope Projection
    if (grounded && hit && hit.normal) {
        const n = new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z);
        // Project movement onto plane defined by normal
        finalMoveDir.projectOnPlane(n).normalize();
    }
    
    const desiredVel = finalMoveDir.multiplyScalar(targetSpeed);
    
    // Variable Inertia
    const isMoving = inputVector.current.lengthSq() > 0;
    // Faster acceleration, slower deceleration (slide)
    const inertia = isMoving ? (isRunning ? 8.0 : 10.0) : 5.0; 
    
    const alpha = 1.0 - Math.exp(-inertia * delta);
    
    const newX = THREE.MathUtils.lerp(currentVel.x, desiredVel.x, alpha);
    const newZ = THREE.MathUtils.lerp(currentVel.z, desiredVel.z, alpha);
    
    let newY = currentVel.y;
    
    // Jump
    if (input.jump && grounded && !isJumping.current) {
        newY = jumpImpulse;
        isJumping.current = true;
        if (actions.jump) {
             actions.jump.reset().setEffectiveWeight(1).play();
        }
    }
    
    // Reset jump state if falling
    if (grounded && isJumping.current && currentVel.y <= 0) {
        isJumping.current = false;
    }
    
    rigidBody.current.setLinvel({ x: newX, y: newY, z: newZ }, true);
    
    // --- 5. Animation Weights ---
    if (!actions) return;
    let idleW = 0, walkW = 0, runW = 0, jumpW = 0;
    
    const speed = Math.sqrt(newX*newX + newZ*newZ);
    
    if (!grounded) {
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
        // Faster blending for responsiveness using higher delta factor
        const step = 10.0 * delta; 
        let next = current + deltaW * Math.min(step, 1.0); 
        action.setEffectiveWeight(next);
    };

    smoothWeight(actions.idle, idleW);
    smoothWeight(actions.walk, walkW);
    smoothWeight(actions.run, runW);
    
    if (actions.jump) {
        // Fade out jump if grounded
        if (grounded && !isJumping.current) smoothWeight(actions.jump, 0);
    }
  });
}
