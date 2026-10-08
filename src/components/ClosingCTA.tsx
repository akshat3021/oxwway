"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { useAccentColor } from "./HeroCanvas";
import Link from "next/link";

function IdleRobot() {
  const groupRef = useRef<THREE.Group>(null);
  
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: "#8B8D93",
    metalness: 0.8,
    roughness: 0.3,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: "#4F7CFF",
    emissive: "#4F7CFF",
    emissiveIntensity: 0.2,
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]} rotation={[0, -Math.PI / 8, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Head */}
        <mesh position={[0, 1.5, 0]} material={metalMaterial}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          {/* Eye / Sensor - Dimmed for idle */}
          <mesh position={[0, 0.1, 0.41]} material={accentMaterial}>
            <planeGeometry args={[0.5, 0.15]} />
          </mesh>
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0, 0]} material={metalMaterial}>
          <boxGeometry args={[1.2, 1.8, 0.6]} />
        </mesh>

        {/* Left Arm Resting */}
        <mesh position={[-1.2, 0, 0.2]} rotation={[0, 0, -0.2]} material={metalMaterial}>
          <cylinderGeometry args={[0.2, 0.2, 1.4]} />
        </mesh>

        {/* Right Arm Resting */}
        <mesh position={[1.2, 0, 0.2]} rotation={[0, 0, 0.2]} material={metalMaterial}>
          <cylinderGeometry args={[0.2, 0.2, 1.4]} />
        </mesh>
      </Float>
    </group>
  );
}

export function ClosingCTA() {
  const accentColor = useAccentColor();
  return (
    <section className="relative py-32 bg-transparent border-t border-foreground/5 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-black/60">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color={accentColor} />
          <IdleRobot />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="font-display text-5xl md:text-7xl uppercase text-foreground mb-12">
          Ready to <br/> <span className="text-accent opacity-80">Engage</span>
        </h2>
        
        <Link 
          href="/contact"
          className="group relative inline-flex items-center justify-center px-12 py-4 border border-accent/50 bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent" />
          <span className="font-mono text-sm uppercase tracking-widest text-accent">
            Initiate Sequence
          </span>
        </Link>
      </div>
    </section>
  );
}
