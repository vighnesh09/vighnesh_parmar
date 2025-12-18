import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export function City(props) {
  const { scene } = useGLTF('/models/environment/scene.gltf')
  
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true
        child.castShadow = false 
      }
    })
  }, [scene])

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} {...props} />
    </RigidBody>
  )
}

useGLTF.preload('/models/environment/scene.gltf')
