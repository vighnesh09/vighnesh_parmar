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
  const smoothing = 0.1; // Smoothing factor for rotation
  const followSharpness = 8;
  const lookSharpness = 12;

  // Base Offsets
  const followOffset = useRef(new THREE.Vector3(0, 2.2, 5));
  const lookAtOffset = useRef(new THREE.Vector3(0, 1.3, 0));

  // Responsive logic
  const { size } = useThree();
  const aspect = size.width / size.height;
  const isMobile = size.width < 768;
  const isPortrait = aspect < 1.0;

  // Update offsets based on screen size
  useEffect(() => {
    if (isPortrait) {
      // Mobile Portrait: Zoom out significantly to see character
      followOffset.current.set(0, 2.5, 9.0);
      lookAtOffset.current.set(0, 1.4, 0);
    } else if (isMobile) {
      // Mobile Landscape or Small Tablet
      followOffset.current.set(0, 2.3, 6.5);
      lookAtOffset.current.set(0, 1.3, 0);
    } else {
      // Desktop / Large Screen
      if (aspect > 2) {
        // Ultrawide zoom out slightly
        followOffset.current.set(0, 2.2, 6.0);
      } else {
        // Standard Desktop
        followOffset.current.set(0, 2.2, 5.0);
      }
      lookAtOffset.current.set(0, 1.3, 0);
    }
  }, [size.width, size.height, isPortrait, isMobile, aspect]);

  // State
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const targetYaw = useRef(0);
  const targetPitch = useRef(THREE.MathUtils.degToRad(-10));
  const isPointerDown = useRef(false);
  const pointer = useRef(new THREE.Vector2());
  const lastTouch = useRef({ x: 0, y: 0 });
  const lookTouchId = useRef(null);

  useEffect(() => {
    const onClick = async () => {
      if (!gl.domElement.requestPointerLock) return;
      try {
        if (document.pointerLockElement === gl.domElement) return;
        await gl.domElement.requestPointerLock();
      } catch (e) {
        console.warn("Pointer lock failed:", e);
      }
    };

    const onPointerMove = (event) => {
      if (document.pointerLockElement === gl.domElement) {
        targetYaw.current -= event.movementX * turnSpeed;
        targetPitch.current -= event.movementY * turnSpeed;
        targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, minPitch, maxPitch);
      }
    };

    const onTouchStart = (event) => {
      // Find a touch that isn't the joystick (or just take the first new available touch)
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];

        // Mobile Layout Hardcoding: Joystick is on Left. Camera is on Right.
        // Ignore touches that start on the left 40% of the screen or so.
        // This ensures the camera doesn't accidentally grab the joystick finger.
        const headerOffset = 0; // If any
        const isRightSide = touch.clientX > window.innerWidth * 0.4;

        // If we aren't already tracking a look touch, claim this one IF it's on the right side
        if (lookTouchId.current === null && isRightSide) {
          lookTouchId.current = touch.identifier;
          lastTouch.current = { x: touch.clientX, y: touch.clientY };
          break; // Only take one
        }
      }
    };

    const onTouchMove = (event) => {
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        if (touch.identifier === lookTouchId.current) {
          const movementX = touch.clientX - lastTouch.current.x;
          const movementY = touch.clientY - lastTouch.current.y;

          targetYaw.current -= movementX * turnSpeed * 1.5;
          targetPitch.current -= movementY * turnSpeed * 1.5;
          targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, minPitch, maxPitch);

          lastTouch.current = { x: touch.clientX, y: touch.clientY };
          break;
        }
      }
    };

    const onTouchEnd = (event) => {
      for (let i = 0; i < event.changedTouches.length; i++) {
        if (event.changedTouches[i].identifier === lookTouchId.current) {
          lookTouchId.current = null;
          break;
        }
      }
    };

    const domElement = gl.domElement;
    domElement.addEventListener("click", onClick);
    document.addEventListener("mousemove", onPointerMove);
    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    domElement.addEventListener("touchend", onTouchEnd);

    return () => {
      domElement.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onPointerMove);
      domElement.removeEventListener("touchstart", onTouchStart);
      domElement.removeEventListener("touchmove", onTouchMove);
      domElement.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!target.current) return;

    // Smooth rotation
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, smoothing);
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, smoothing);

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
    // We want character on the right side of screen for desktop.
    // For mobile, we want character slightly left or centered.

    // Desktop: Position camera closer (z: 2.3) and slightly left (x: -0.4) to keep character on right.
    // Mobile: Position camera slightly right (x: 0.5) to keep character on left, and zoomed out (z: 4.5) for portrait FOV.

    const introOffsetVector = isMobile
      ? new THREE.Vector3(0.5, 1, 2 ) // Zoomed in from 4.0
      : new THREE.Vector3(-0.4, 1.4, 2.3);

    const introLookAtOffsetVector = isMobile
      ? new THREE.Vector3(0, 1.2, 0) // Look slightly higher on character
      : new THREE.Vector3(-1, 1.2, 0); // Look left of character

    const introPos = targetWorldPos.clone().add(introOffsetVector);
    const introLookAt = targetWorldPos.clone().add(introLookAtOffsetVector);

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
