"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useState } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

gsap.registerPlugin(ScrollTrigger);

export function useAccentColor() {
  const [color, setColor] = useState("#E8342A"); // fallback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const val = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (val) setColor(val);
    }
  }, []);
  return color;
}

function RobotPlaceholder() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Scroll-scrubbed assembly animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1, // Smooth scrubbing
      },
    });

    // Assembly sequence
    tl.fromTo(
      headRef.current!.position,
      { y: 5 },
      { y: 1.5, duration: 1 },
      0
    )
    .fromTo(
      torsoRef.current!.position,
      { z: -5 },
      { z: 0, duration: 1 },
      0
    )
    .fromTo(
      [leftArmRef.current!.position, rightArmRef.current!.position],
      { x: (i) => (i === 0 ? -5 : 5) },
      { x: (i) => (i === 0 ? -1.5 : 1.5), duration: 1 },
      0
    )
    .to(
      groupRef.current.rotation,
      { y: Math.PI * 2, duration: 2 },
      0
    );

    return () => {
      tl.kill();
    };
  }, []);

  useFrame((state, delta) => {
    if (outerGroupRef.current) {
      outerGroupRef.current.rotation.y += delta * 0.1;
    }
  });

  const accentColor = useAccentColor();

  // Material setup for that premium brushed-metal look
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: "#8B8D93",
    metalness: 0.8,
    roughness: 0.3,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.5,
  });

  return (
    <group ref={outerGroupRef} position={[0, -1, 0]}>
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Head */}
        <mesh ref={headRef} position={[0, 1.5, 0]} material={metalMaterial}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          {/* Eye / Sensor */}
          <mesh position={[0, 0.1, 0.41]} material={accentMaterial}>
            <planeGeometry args={[0.5, 0.15]} />
          </mesh>
        </mesh>

        {/* Torso */}
        <mesh ref={torsoRef} position={[0, 0, 0]} material={metalMaterial}>
          <boxGeometry args={[1.2, 1.8, 0.6]} />
        </mesh>

        {/* Left Arm */}
        <mesh ref={leftArmRef} position={[-1.5, 0.2, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.2, 0.2, 1.4]} />
        </mesh>

        {/* Right Arm */}
        <mesh ref={rightArmRef} position={[1.5, 0.2, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.2, 0.2, 1.4]} />
        </mesh>
      </Float>
      </group>
    </group>
  );
}

export function HeroCanvas() {
  const accentColor = useAccentColor();
  const isMobile = useIsMobile();
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: !isMobile, alpha: true }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 2, 5]} intensity={1} color={accentColor} distance={10} />
        <RobotPlaceholder />
      </Canvas>
    </div>
  );
}
