import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useInput } from './useInput';

const UP = new THREE.Vector3(0, 1, 0);

export function useCharacterController({ animations, rigidBody, group, getCameraYaw, isIntro }) {
    const { actions } = animations;
    const input = useInput();
    const { world, rapier } = useRapier(); // Access Rapier world and instance

    // Config
    const walkSpeed = 4.0;
    const runSpeed = 12.0;
    const rotationSpeed = 6.0; // Smoother turning
    const jumpImpulse = 3.5; // ~0.6m jump height with Earth gravity

    // State Refs
    const isGrounded = useRef(true);
    const isJumping = useRef(false); // For animation states
    const inputVector = useRef(new THREE.Vector3());
    const movementDuration = useRef(0); // Track how long user has been moving

    // AFK State
    const [isAfk, setIsAfk] = useState(false);
    const timeSinceLastInput = useRef(0);

    // Audio State
    const runSoundBuffer = useLoader(THREE.AudioLoader, "/sound/running_on_concrete.mp3");
    const audioContext = useRef(null);
    const audioSource = useRef(null);
    const gainNode = useRef(null);

    // Initialize Audio Context & Gain
    useEffect(() => {
        audioContext.current = THREE.AudioContext.getContext();
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 0.6; // Volume
        gainNode.current.connect(audioContext.current.destination);

        return () => {
            if (audioSource.current) {
                audioSource.current.stop();
            }
        };
    }, []);

    // Explicitly reset AFK if intro is on
    useEffect(() => {
        if (isIntro) {
            setIsAfk(false);
            timeSinceLastInput.current = 0;
        }
    }, [isIntro]);

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
            if (input.forward) inputVector.current.z -= 1;
            if (input.backward) inputVector.current.z += 1;
            if (input.left) inputVector.current.x -= 1;
            if (input.right) inputVector.current.x += 1;

            // Joystick Input
            if (input.joystick) {
                inputVector.current.x += input.joystick.x;
                inputVector.current.z += input.joystick.y;
            }
        }

        // AFK Logic
        const hasInput = inputVector.current.lengthSq() > 0 || input.jump;
        if (hasInput || isIntro) {
            timeSinceLastInput.current = 0;
            if (isAfk) setIsAfk(false);
        } else {
            timeSinceLastInput.current += delta;
            // 4.5 seconds threshold for AFK message
            if (timeSinceLastInput.current > 4.5 && !isAfk) {
                setIsAfk(true);
            }
        }

        if (inputVector.current.lengthSq() > 0) {
            inputVector.current.normalize();
        }

        const isRunning = input.run; // keep shift for instant run if desired, or remove if auto-only

        // Auto-acceleration Logic
        if (inputVector.current.lengthSq() > 0) {
            movementDuration.current += delta;
        } else {
            movementDuration.current = 0;
        }

        let targetSpeed = 0;
        if (inputVector.current.lengthSq() > 0) {
            // Constants
            const WALK_DURATION = 0.2; // Seconds to walk before running
            const RAMP_DURATION = 0.5; // Seconds to ramp from walk to run

            if (isRunning) {
                // Shift key forces run immediately
                targetSpeed = runSpeed;
            } else {
                if (movementDuration.current < WALK_DURATION) {
                    targetSpeed = walkSpeed;
                } else {
                    const accelerationTime = movementDuration.current - WALK_DURATION;
                    const t = Math.min(accelerationTime / RAMP_DURATION, 1.0);
                    // Smooth ease-in-out or just linear? Linear is usually fine for speed ramp.
                    targetSpeed = THREE.MathUtils.lerp(walkSpeed, runSpeed, t);
                }
            }
        } else {
            targetSpeed = 0;
        }

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
        const currentSpeed = Math.sqrt(currentVel.x ** 2 + currentVel.z ** 2);

        let inertia = 10.0;
        if (isMoving) {
            // While moving: Run = 8.0 (smoother), Walk = 10.0 (responsive)
            inertia = (isRunning || targetSpeed > walkSpeed * 1.2) ? 8.0 : 10.0;
        } else {
            // While stopping: High speed = 5.0 (slide), Low speed = 10.0 (quick stop)
            inertia = (currentSpeed > walkSpeed * 1.2) ? 5.0 : 10.0;
        }

        const alpha = 1.0 - Math.exp(-inertia * delta);

        let newX = THREE.MathUtils.lerp(currentVel.x, desiredVel.x, alpha);
        let newZ = THREE.MathUtils.lerp(currentVel.z, desiredVel.z, alpha);

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

        // --- Boundary Check ---
        const CITY_LIMIT = 85.0; // Distance from center
        const nextPos = {
            x: origin.x + newX * delta,
            z: origin.z + newZ * delta
        };

        const distSq = nextPos.x * nextPos.x + nextPos.z * nextPos.z;
        if (distSq > CITY_LIMIT * CITY_LIMIT) {
            // If moving away from center, stop.
            // Simple approach: if outside limit, damp velocity towards center
            const currentDist = Math.sqrt(origin.x * origin.x + origin.z * origin.z);
            if (currentDist > CITY_LIMIT) {
                // Allow moving back towards center, block moving away
                const toCenter = { x: -origin.x, z: -origin.z };
                const dot = newX * toCenter.x + newZ * toCenter.z;
                if (dot < 0) {
                    // Moving away: kill velocity
                    newX = 0;
                    newZ = 0;
                }
            }
        }

        rigidBody.current.setLinvel({ x: newX, y: newY, z: newZ }, true);

        // --- 5. Animation Weights ---
        if (!actions) return;
        let idleW = 0, walkW = 0, runW = 0, jumpW = 0;

        const speed = Math.sqrt(newX * newX + newZ * newZ);

        // Audio Logic in useFrame
        const shouldPlay = grounded && speed > 2.5;

        if (shouldPlay) {
            if (!audioSource.current && audioContext.current) {
                // Resume context if suspended (browser requirement)
                if (audioContext.current.state === 'suspended') {
                    audioContext.current.resume();
                }

                const src = audioContext.current.createBufferSource();
                src.buffer = runSoundBuffer;
                src.loop = true;
                // TRIM LOGIC: Adjust these to remove start/stop silence
                src.loopStart = 0.5;
                // Safety check for duration
                const duration = runSoundBuffer.duration || 10;
                // Trim 1.5s from end if duration allows, else just 0.5s margin
                src.loopEnd = Math.max(0.6, duration - 1.7);

                src.connect(gainNode.current);
                src.start(0);
                audioSource.current = src;
            }
        } else {
            if (audioSource.current) {
                audioSource.current.stop();
                audioSource.current = null;
            }
        }

        if (!grounded) {
            jumpW = 1.0;
        } else {
            if (speed < 0.2) {
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

    return { isAfk: isAfk && !isIntro };
}
