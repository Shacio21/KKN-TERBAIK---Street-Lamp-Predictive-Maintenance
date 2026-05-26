import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Lights from './Lights';

export default function Scene({ children, className = '', style = {} }) {
  return (
    <Canvas
      className={className}
      style={style}
      shadows
      dpr={[1, 2]}
      camera={{ position: [4, 3, 6], fov: 45, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
      }}
    >
      <fog attach="fog" args={['#030712', 5, 30]} />
      <Suspense fallback={null}>
        <Lights />

        {/* Starfield background */}
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Contact shadow on ground */}
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4}
          color="#00D4FF"
        />

        {children}

        {/* Post Processing Effects */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.8}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
