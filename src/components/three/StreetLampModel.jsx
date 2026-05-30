import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import GlassCard from '../ui/GlassCard';
import { explodedComponents } from '../../data/mockData';

const targetPositions = {
  solar: new THREE.Vector3(-9, 5, 0),
  lamp: new THREE.Vector3(-3, 4, 0),
  battery: new THREE.Vector3(3, 4.5, 0),
  esp: new THREE.Vector3(9, 3.8, 0),
};

const labelPositions = {
  solar: new THREE.Vector3(0.5, 4.5, 0),
  lamp: new THREE.Vector3(-1, 4, 0),
  battery: new THREE.Vector3(-0.3, 3.3, 0),
  esp: new THREE.Vector3(1.3, 3.5, 0),
};

const cardPositions = {
  solar: new THREE.Vector3(-3.8, 0.5, 0),
  lamp: new THREE.Vector3(-1.3, 0.5, 0),
  battery: new THREE.Vector3(1.3, 0.5, 0),
  esp: new THREE.Vector3(3.8, 0.5, 0),
};

const targetRotations = {
  solar: new THREE.Euler(0, 200, 0), // 0 berarti menggunakan rotasi asli dari Blender
  lamp: new THREE.Euler(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(90), 0), // Contoh: Diputar 90 derajat ke depan (berdiri/nunduk)
  battery: new THREE.Euler(0, 0, 0),
  esp: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-90)), // Contoh: Diputar -90 derajat menyamping (tiduran)
};

export default function StreetLampModel({
  isExploded = false,
  rotate = true,
  floatEffect = true,
}) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/streetlamp.glb');
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.updateMatrixWorld(true);
    const meshesToFlatten = [];

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        let currentObj = child;
        let assignedPart = 'pole'; 

        while (currentObj) {
          const nameLower = currentObj.name.toLowerCase();
          const nameOrig = currentObj.name;

          if (nameLower.includes('cube025')) { assignedPart = 'esp'; break; } 
          else if (nameLower.includes('solarpanel_28')) { assignedPart = 'solar'; break; } 
          else if (nameLower.includes('batterybox_22') || nameLower.includes('batterbox_22')) { assignedPart = 'battery'; break; } 
          else if (nameOrig === '_2' || nameOrig.startsWith('_2_') || nameOrig.startsWith('_2')) { assignedPart = 'lamp'; break; }
          currentObj = currentObj.parent;
        }
        
        child.userData.partType = assignedPart;
        meshesToFlatten.push(child);
      }
    });

    meshesToFlatten.forEach((mesh) => {
      if (mesh.parent && mesh.parent !== clonedScene) {
        clonedScene.attach(mesh);
      }
      
      // =======================================================
      // FIX ROTASI MENGORBIT: Pindahkan Origin ke Tengah Geometri
      // =======================================================
      mesh.geometry = mesh.geometry.clone(); // Clone agar aman
      mesh.geometry.computeBoundingBox();
      const offset = new THREE.Vector3();
      mesh.geometry.boundingBox.getCenter(offset);
      
      // Geser titik pusat geometri ke 0,0,0
      mesh.geometry.translate(-offset.x, -offset.y, -offset.z);
      
      // Kompensasi posisi mesh agar tidak berubah letaknya di layar
      offset.multiply(mesh.scale);
      offset.applyQuaternion(mesh.quaternion);
      mesh.position.add(offset);
      // =======================================================

      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalRotation = mesh.rotation.clone();

      if (mesh.material) {
        mesh.material = mesh.material.clone();
        mesh.userData.originalEmissive = mesh.material.emissive 
          ? mesh.material.emissive.clone() 
          : new THREE.Color('#000000');
      }
    });

  }, [clonedScene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (isExploded) {
      state.camera.position.lerp(new THREE.Vector3(0, 0, 10), 4 * delta);
    } else {
      state.camera.position.lerp(new THREE.Vector3(4, 3, 6), 4 * delta);
    }
    state.camera.lookAt(0, 2, 0);

    if (rotate && !isExploded) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t * 0.3) * 0.15, 5 * delta);
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 5 * delta);
    }

    if (floatEffect && !isExploded) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, Math.sin(t * 0.5) * 0.05, 5 * delta);
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 5 * delta);
    }

    clonedScene.traverse((child) => {
      if (child.isMesh && child.userData.originalPosition) {
        const part = child.userData.partType;
        
        let targetPos = child.userData.originalPosition.clone();
        let targetScale = child.userData.originalScale.clone();
        let targetRot = child.userData.originalRotation.clone();

        if (isExploded) {
          if (part === 'pole') {
            targetScale.set(0, 0, 0); 
          } else if (targetPositions[part]) {
            targetPos.copy(targetPositions[part]); 
            targetScale.multiplyScalar(4);
            
            if (targetRotations[part]) {
              // Menimpa rotasi asli dengan rotasi derajat yang kamu atur di atas
              targetRot.x = targetRotations[part].x;
              targetRot.y = targetRotations[part].y;
              targetRot.z = targetRotations[part].z;
            }
            // =======================================================
            // FIX ROTASI ESP32: Gunakan sumbu Z (atau X) agar horizontal
            // =======================================================
            if (part === 'lamp') {
              targetRot.z += t * 0.5; // Ganti huruf 'z' menjadi 'x' jika putarannya masih aneh
            } else {
              targetRot.y += t * 0.5; // Komponen lain berputar di sumbu Y
            }
          }
        }

        child.position.lerp(targetPos, 1.5 * delta);
        child.scale.lerp(targetScale, 1.5 * delta);

        const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);
        child.quaternion.slerp(targetQuat, 2 * delta);

        if (child.material && child.userData.originalEmissive) {
          const targetEmissive = child.userData.originalEmissive.clone();
          if (isExploded && part !== 'pole') {
            targetEmissive.add(new THREE.Color('#333333')); 
          }
          child.material.emissive.lerp(targetEmissive, 3 * delta);
        }
      }
    });
  });

  const renderOverlays = () => {
    return explodedComponents.map((comp) => {
      const name = comp.name.toLowerCase();
      let pKey = 'pole';
      if (name.includes('lamp')) pKey = 'lamp';
      else if (name.includes('solar')) pKey = 'solar';
      else if (name.includes('batter')) pKey = 'battery';
      else if (name.includes('esp')) pKey = 'esp';

      const explodedPos = targetPositions[pKey];
      const cardPos = cardPositions[pKey]; 

      if (!explodedPos || !cardPos) return null;

      return (
        <React.Fragment key={comp.id}>
          <Html position={labelPositions[pKey]} center className={`transition-opacity duration-500 pointer-events-none ${!isExploded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-neon-blue text-[10px] font-bold tracking-widest uppercase bg-bg-primary/80 px-2 py-1 rounded border border-neon-blue/30 backdrop-blur-sm shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              {comp.name}
            </div>
          </Html>

          <Html position={cardPos} center className={`transition-all duration-700 w-48 ${isExploded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <GlassCard glow={true} className="p-4 border-t-2 shadow-lg" style={{ borderTopColor: comp.color, boxShadow: `0 10px 30px -10px ${comp.color}40` }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: comp.color }}>{comp.name}</h3>
              <p className="text-text-secondary text-[10px] leading-relaxed mb-3">{comp.description}</p>
              <div className="flex flex-wrap gap-1">
                {comp.specs.map(spec => (
                  <span key={spec} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${comp.color}15`, border: `1px solid ${comp.color}30`, color: comp.color }}>
                    {spec}
                  </span>
                ))}
              </div>
            </GlassCard>
          </Html>
        </React.Fragment>
      );
    });
  };

  return (
    <group ref={groupRef} position={[0, -3.5, 0]}>
      <Center scale={0.4} top>
        <primitive object={clonedScene} />
      </Center>
      {renderOverlays()}
    </group>
  );
}

useGLTF.preload('/models/streetlamp.glb');