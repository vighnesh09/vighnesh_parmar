"use client";

import { useGLTF } from "@react-three/drei";

export function ModelPreloader() {
  useGLTF.preload("/models/Breathing_Idle.glb");
  useGLTF.preload("/models/walking.glb");
  useGLTF.preload("/models/running.glb");
  useGLTF.preload("/models/jumping.glb");

  return null;
}
