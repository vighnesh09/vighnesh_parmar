import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function useThirdPersonCamera({ target }) {
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
    const desiredOffset = followOffset.current.clone().applyQuaternion(rotation);
    
    const targetWorldPos = new THREE.Vector3();
    target.current.getWorldPosition(targetWorldPos);

    const desiredPosition = targetWorldPos.clone().add(desiredOffset);

    // Smooth follow
    const followT = 1 - Math.exp(-followSharpness * delta);
    currentPosition.current.lerp(desiredPosition, followT);
    camera.position.copy(currentPosition.current);

    // Look At
    const desiredLookAt = targetWorldPos.clone().add(lookAtOffset.current);
    const lookT = 1 - Math.exp(-lookSharpness * delta);
    currentLookAt.current.lerp(desiredLookAt, lookT);
    camera.lookAt(currentLookAt.current);
  });

  return { yaw };
}
