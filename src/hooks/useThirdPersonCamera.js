import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function useThirdPersonCamera({ target, isIntro }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(THREE.MathUtils.degToRad(-10));
  
  // Params
  const minPitch = THREE.MathUtils.degToRad(-35);
  const maxPitch = THREE.MathUtils.degToRad(25);
  const turnSpeed = 0.0025;
  const followSharpness = 8;
  const lookSharpness = 12;
  const followOffset = useRef(new THREE.Vector3(0, 2.2, 5));
  const lookAtOffset = useRef(new THREE.Vector3(0, 1.3, 0));
  
  // State
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const isPointerDown = useRef(false);
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    const onPointerDown = (event) => {
      isPointerDown.current = true;
      pointer.current.set(event.clientX, event.clientY);
      gl.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!isPointerDown.current) return;
      
      const deltaX = event.clientX - pointer.current.x;
      const deltaY = event.clientY - pointer.current.y;
      pointer.current.set(event.clientX, event.clientY);

      yaw.current -= deltaX * turnSpeed;
      pitch.current -= deltaY * turnSpeed;
      pitch.current = THREE.MathUtils.clamp(pitch.current, minPitch, maxPitch);
    };

    const onPointerUp = (event) => {
      isPointerDown.current = false;
      try {
          gl.domElement.releasePointerCapture(event.pointerId);
      } catch (e) {
          // pointer might have been released already
      }
    };

    const domElement = gl.domElement;
    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!target.current) return;

    // Calculate desired position
    const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));
    
    // Normal follow offset
    const standardOffset = followOffset.current.clone().applyQuaternion(rotation);
    
    // Intro Offset: Fixed relative to character or world? 
    // Let's make it relative to character but front-facing.
    // If character is at (0,0,0) facing Z-, we want camera at slightly right front.
    // Actually, "camera moves to our current view". Let's assume standard gameplay view is "behind".
    // Intro view: "Right side has character in zoom". 
    // This means camera should be to the LEFT of the character, facing the character, so character appears on right of screen.
    // Character is typically at (0,0,-5) or similar.
    // Let's hardcode an "Intro Offset" that is relative to the character's forward.
    // Assuming character starts facing Z-, Back is Z+, Left is X-.
    // If we put camera at [-2, 1.5, 3] relative to character, looking at character.
    // Let's try to calculate two potential camera positions and lerp between them.

    const targetWorldPos = new THREE.Vector3();
    target.current.getWorldPosition(targetWorldPos);
    
    // GAMEPLAY TARGET POSITION
    const gameplayPos = targetWorldPos.clone().add(standardOffset);
    // Focus slightly above the pivot (approx head height)
    const lookAtTarget = targetWorldPos.clone().add(lookAtOffset.current);
    lookAtTarget.y += 1.3;

    // INTRO TARGET POSITION
    // We want character on the right side of screen.
    // So camera needs to look slightly to the LEFT of the character.
    // OR we just position the camera such that character is naturally on the right.
    // Let's position camera at (x: -1.5, y: 1.4, z: 2.5) relative to character.
    // And look at the character's shoulder.
    const introOffsetVector = new THREE.Vector3(-1.2, 1.4, 3.5); // Close up, slightly left
    // Apply initial yaw if needed, but intro usually fixed. 
    // To ensure consistency, let's treat intro as a fixed offset relative to character's initial orientation (Identity).
    const introPos = targetWorldPos.clone().add(introOffsetVector); 
    const introLookAt = targetWorldPos.clone().add(new THREE.Vector3(0, 1.2, 0)); // Look at chest

    // Determine Final Targets based on isIntro
    const desiredPos = isIntro ? introPos : gameplayPos;
    const desiredLook = isIntro ? introLookAt : lookAtTarget;

    // SMOOTH CAMERA MOVEMENT
    // If we just changed modes, we want a smooth transition.
    // We can just use the existing lerp, but might need to adjust speed.
    // Intro -> Gameplay transition should be somewhat fast but smooth.
    
    const transitionSpeed = isIntro ? 4.0 : followSharpness; // Slower in intro for drift? or fast snap?
    
    const t = 1.0 - Math.exp(-transitionSpeed * delta);
    
    currentPosition.current.lerp(desiredPos, t);
    currentLookAt.current.lerp(desiredLook, t);
    
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return { yaw };
}
