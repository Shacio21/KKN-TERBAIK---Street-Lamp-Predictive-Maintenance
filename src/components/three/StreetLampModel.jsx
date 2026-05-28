import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";

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
    const { scene } = useGLTF("/models/streetlamp.glb");

    // Clone the scene so we can mutate it freely
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    useEffect(() => {
        clonedScene.traverse((child) => {
            // Kita hanya memanipulasi posisi pada level Mesh
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData.originalPosition = child.position.clone();

                let currentObj = child;
                let assignedPart = "pole"; // Default jika tidak ada yang cocok

                // Looping untuk mengecek nama dirinya dan semua parent di atasnya
                while (currentObj) {
                    const nameLower = currentObj.name.toLowerCase();
                    const nameOrig = currentObj.name;

                    // Pengecekan nama asli seperti yang ada di Console
                    if (nameLower.includes("solarpanel_28")) {
                        assignedPart = "solar";
                        break;
                    } else if (nameLower.includes("batterybox_22")) {
                        assignedPart = "battery";
                        break;
                    } else if (
                        nameOrig === "_2" ||
                        nameOrig.startsWith("_2_") ||
                        nameOrig.startsWith("_2")
                    ) {
                        assignedPart = "lamp";
                        break;
                    }

                    // Jika tidak cocok, naik cek grup parent di atasnya
                    currentObj = currentObj.parent;
                }

                // Karena kamu belum menambahkan ESP, saya menghapus tebakan fallback untuk ESP
                // agar tidak menabrak objek tiang secara tidak sengaja.

                child.userData.partType = assignedPart;
            }
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

                if (child.userData.partType === "lamp") offset = lampOffset;
                else if (child.userData.partType === "solar")
                    offset = solarOffset;
                else if (child.userData.partType === "battery")
                    offset = batteryOffset;
                else if (child.userData.partType === "esp") offset = espOffset;

                child.position.set(
                    child.userData.originalPosition.x + offset[0],
                    child.userData.originalPosition.y + offset[1],
                    child.userData.originalPosition.z + offset[2],
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

useGLTF.preload("/models/streetlamp.glb");
