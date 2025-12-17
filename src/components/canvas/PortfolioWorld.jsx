import { Text, Float } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export function PortfolioWorld() {
  return (
    <group>
      {/* Intro Zone - Spawn Point */}
      <group position={[0, 0, -5]}>
         <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <Text
                fontSize={3}
                color="white"
                anchorX="center"
                anchorY="middle"
                position={[0, 4, -8]}
                maxWidth={20}
                textAlign="center"
            >
                VIGHNESH
            </Text>
            <Text
                fontSize={1.2}
                color="#a0a0a0"
                position={[0, 1.5, -8]}
            >
                CREATIVE DEVELOPER
            </Text>
         </Float>
      </group>

      {/* About Section - Left Wing */}
      <group position={[-20, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
         <SectionTitle position={[0, 6, 0]} text="ABOUT ME" />
         <InfoBoard 
            position={[0, 2.5, 0]} 
            text={`I am a passionate developer\nbuilding immersive web experiences.\n\nI love 3D graphics, React,\nand interactive design.`} 
         />
      </group>

      {/* Experience Section - Back Wing */}
      <group position={[0, 0, 25]}>
          <SectionTitle position={[0, 6, 0]} text="EXPERIENCE" />
          {/* Timeline Pillars */}
          <ExperiencePillar position={[-6, 0, 3]} role="Junior Dev" company="Startup Inc" year="2022" />
          <ExperiencePillar position={[0, 0, 3]} role="Developer" company="Tech Corp" year="2023" />
          <ExperiencePillar position={[6, 0, 3]} role="Senior Dev" company="Future Systems" year="2024" />
      </group>

      {/* Projects Section - Right Wing */}
      <group position={[20, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
          <SectionTitle position={[0, 6, 0]} text="PROJECTS" />
          <ProjectCube position={[-4, 1, 3]} color="#ff6b6b" name="Project A" />
          <ProjectCube position={[4, 1, 3]} color="#4ecdc4" name="Project B" />
      </group>
      
    </group>
  );
}

function SectionTitle({ position, text }) {
    return (
        <Text
            position={position}
            fontSize={2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
}

function InfoBoard({ position, text }) {
    return (
        <group position={position}>
            <RigidBody type="fixed">
                 <mesh receiveShadow>
                     <boxGeometry args={[12, 6, 0.5]} />
                     <meshStandardMaterial color="#222" />
                 </mesh>
            </RigidBody>
            <Text
                position={[0, 0, 0.3]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={10}
                lineHeight={1.5}
                textAlign="center"
            >
                {text}
            </Text>
        </group>
    )
}

function ExperiencePillar({ position, role, company, year }) {
    return (
        <group position={position}>
            <RigidBody type="fixed" colliders="hull">
                <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
                    <boxGeometry args={[2, 3, 2]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
            </RigidBody>
            <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
                <Text position={[0, 4, 0]} fontSize={0.6} color="#4ecdc4" anchorX="center">{role}</Text>
                <Text position={[0, 3.4, 0]} fontSize={0.4} color="white" anchorX="center">{company}</Text>
                <Text position={[0, 2.9, 0]} fontSize={0.3} color="#888" anchorX="center">{year}</Text>
            </Float>
        </group>
    )
}

function ProjectCube({ position, color, name }) {
    return (
        <group position={position}>
             <RigidBody type="dynamic" colliders="cuboid" restitution={0.5}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color={color} />
                </mesh>
             </RigidBody>
             <Text position={[0, 2.5, 0]} fontSize={0.6} color="white" anchorX="center">{name}</Text>
        </group>
    )
}
