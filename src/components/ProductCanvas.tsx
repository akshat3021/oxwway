"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useAccentColor } from "./HeroCanvas";
import { useIsMobile } from "@/lib/useIsMobile";

const robotModels = [
  {
    id: "ox-1",
    name: "OX-1 Core",
    specs: [
      { id: "payload", name: "Max Payload", value: "45kg", pos: [0, 0, 0.4] as [number, number, number] },
      { id: "battery", name: "Uptime", value: "14 hrs", pos: [0, 1.8, 0] as [number, number, number] },
      { id: "sensor", name: "Optical Array", value: "4x 8K LiDAR", pos: [0, 1.6, 0.5] as [number, number, number] },
    ]
  }
];

export function ProductCanvas({ activeSpec, setActiveSpec }: { activeSpec: string | null, setActiveSpec: (id: string | null) => void }) {
  const model = robotModels[0]; // Assuming OX-1 is selected for now
  const accentColor = useAccentColor();
  const isMobile = useIsMobile();

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: "#8B8D93",
    metalness: 0.8,
    roughness: 0.3,
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: !isMobile }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[5, 0, 5]} intensity={0.5} color={accentColor} />

      <group position={[0, -1, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Base Robot Geometry - Simplified */}
          <mesh position={[0, 1.5, 0]} material={metalMaterial}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
          </mesh>
          <mesh position={[0, 0, 0]} material={metalMaterial}>
            <boxGeometry args={[1.2, 1.8, 0.6]} />
          </mesh>
          <mesh position={[-1.5, 0.2, 0]} material={metalMaterial}>
            <cylinderGeometry args={[0.2, 0.2, 1.4]} />
          </mesh>
          <mesh position={[1.5, 0.2, 0]} material={metalMaterial}>
            <cylinderGeometry args={[0.2, 0.2, 1.4]} />
          </mesh>

          {/* Hotspots */}
          {model.specs.map(spec => (
            <group key={spec.id} position={spec.pos}>
              <Html center>
                <button 
                  onClick={() => setActiveSpec(activeSpec === spec.id ? null : spec.id)}
                  className={`w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center transition-all ${
                    activeSpec === spec.id ? "bg-accent scale-125" : "bg-background/80 hover:bg-accent/20"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeSpec === spec.id ? "bg-background" : "bg-accent"}`} />
                </button>
              </Html>
            </group>
          ))}
        </Float>
      </group>
    </Canvas>
  );
}
