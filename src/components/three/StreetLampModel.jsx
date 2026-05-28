import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function StreetLampModel({
  lampOffset = [0, 0, 0],
  solarOffset = [0, 0, 0],
  batteryOffset = [0, 0, 0],
  espOffset = [0, 0, 0],
  rotate = true,
  floatEffect = true,
}) {
  const groupRef = useRef();
  
  // Load the GLB model
  const { scene } = useGLTF('/models/streetlamp.glb');
  
  // Clone the scene so we can mutate it freely
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    // Array untuk menampung mesh yang akan diratakan posisinya
    const meshesToFlatten = [];

    // TAHAP 1: Identifikasi dan tandai semua mesh berdasarkan hierarki aslinya
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        let currentObj = child;
        let assignedPart = 'pole'; 

        while (currentObj) {
          const nameLower = currentObj.name.toLowerCase();
          const nameOrig = currentObj.name;

          if (nameLower.includes('cube025')) {
            assignedPart = 'esp';
            break;
          } else if (nameLower.includes('solarpanel_28')) {
            assignedPart = 'solar';
            break;
          } else if (nameLower.includes('batterybox_22') || nameLower.includes('batterbox_22')) {
            assignedPart = 'battery';
            break;
          } else if (nameOrig === '_2' || nameOrig.startsWith('_2_') || nameOrig.startsWith('_2')) {
            assignedPart = 'lamp';
            break;
          }

          currentObj = currentObj.parent;
        }
        
        child.userData.partType = assignedPart;
        meshesToFlatten.push(child);
      }
    });

    // TAHAP 2: Keluarkan mesh dari parent-nya dan sejajarkan di root scene
    meshesToFlatten.forEach((mesh) => {
      // .attach akan memindah mesh ke root tanpa mengubah posisinya secara visual
      if (mesh.parent && mesh.parent !== clonedScene) {
        clonedScene.attach(mesh);
      }
      // Simpan posisi koordinat global yang sudah bersih
      mesh.userData.originalPosition = mesh.position.clone();
    });

  }, [clonedScene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (rotate) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }

    if (floatEffect) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
    }

    clonedScene.traverse((child) => {
      if (child.isMesh && child.userData.originalPosition) {
        let offset = [0, 0, 0];
        
        if (child.userData.partType === 'lamp') offset = lampOffset;
        else if (child.userData.partType === 'solar') offset = solarOffset;
        else if (child.userData.partType === 'battery') offset = batteryOffset;
        else if (child.userData.partType === 'esp') offset = espOffset;
        
        // Sekarang offset ditambahkan secara adil dalam koordinat global (World Space)
        child.position.set(
          child.userData.originalPosition.x + offset[0],
          child.userData.originalPosition.y + offset[1],
          child.userData.originalPosition.z + offset[2]
        );
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      <Center scale={0.4} top>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/models/streetlamp.glb');