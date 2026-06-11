export default function Lights() {
  return (
    <>
      {/* Ambient base light */}
      <ambientLight intensity={0.15} color="#4a5568" />

      {/* Main directional light (moonlight feel) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.4}
        color="#a0c4ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Rim light for dramatic silhouette */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.2}
        color="#8B5CF6"
      />

      {/* Neon blue accent light */}
      <pointLight
        position={[0, 5.5, 1]}
        intensity={2}
        color="#00D4FF"
        distance={5}
        decay={2}
      />

      {/* Ground bounce light */}
      <pointLight
        position={[0, 0, 2]}
        intensity={0.3}
        color="#00D4FF"
        distance={8}
        decay={2}
      />

      {/* Subtle green from battery */}
      <pointLight
        position={[-1, 3, 1]}
        intensity={0.5}
        color="#00FF88"
        distance={3}
        decay={2}
      />
    </>
  );
}
