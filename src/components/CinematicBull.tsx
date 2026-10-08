"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAccentColor } from "./HeroCanvas";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTexture } from "@react-three/drei";
import { useTheme } from "./ThemeProvider";

gsap.registerPlugin(ScrollTrigger);

function ArchitecturalBullTexture() {
  const group = useRef<THREE.Group>(null);
  const accentColor = useAccentColor();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { theme } = useTheme();
  const themeObj = useRef({ val: theme === "light" ? 1.0 : 0.0 });
  
  useEffect(() => {
    gsap.to(themeObj.current, {
      val: theme === "light" ? 1.0 : 0.0,
      duration: 1.0,
      ease: "power2.inOut"
    });
  }, [theme]);

  const logoTex = useTexture("/logo.jpg");
  logoTex.minFilter = THREE.LinearFilter;

  const shader = useMemo(() => ({
    uniforms: {
      tDiffuse: { value: logoTex },
      accentColor: { value: new THREE.Color(accentColor) },
      time: { value: 0 },
      mouse: { value: new THREE.Vector2(0, 0) },
      uTheme: { value: themeObj.current.val }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform sampler2D tDiffuse;
      
      void main() {
        vUv = uv;
        vec4 texColor = texture2D(tDiffuse, vUv);
        float mask = 1.0 - texColor.r; 
        
        vec3 displaced = position + normal * mask * 0.2;
        vPosition = displaced;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform sampler2D tDiffuse;
      uniform vec3 accentColor;
      uniform float time;
      uniform vec2 mouse;
      uniform float uTheme; // 0.0 = dark, 1.0 = light
      
      void main() {
        vec4 texColor = texture2D(tDiffuse, vUv);
        float mask = 1.0 - texColor.r;
        
        if (mask < 0.05) discard;

        // Dark Mode: We want a graphite/titanium look. 
        // If we only have 6% opacity, the base color must be bright enough to be visible!
        // A pure white or bright grey base multiplied by 6% opacity yields a subtle graphite watermark.
        vec3 darkBase = vec3(0.7, 0.75, 0.8); 
        // Light Mode: Anodized Red.
        vec3 lightBase = vec3(0.9, 0.1, 0.1); 
        
        vec3 color = mix(darkBase, lightBase, uTheme);
        
        // Interactive Spotlight: softly reveals the brushed metal texture based on mouse
        // Map mouse from [-1, 1] to UV [0, 1] space approximately
        vec2 mouseUv = vec2(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5);
        float distToMouse = distance(vUv, mouseUv);
        float spotlight = smoothstep(0.8, 0.0, distToMouse);
        
        // Simulating subtle brushed metal reflections (moving slowly)
        float reflection = sin(vPosition.x * 4.0 + time * 0.2) * 0.5 + 0.5;
        reflection *= cos(vPosition.y * 4.0 - time * 0.2) * 0.5 + 0.5;
        
        vec3 reflColor = mix(vec3(0.4), vec3(0.5, 0.1, 0.1), uTheme);
        color += reflColor * reflection * (spotlight * 0.5 + 0.5);
        
        // Red glowing eye
        float isRed = smoothstep(0.1, 0.5, texColor.r - max(texColor.g, texColor.b));
        
        if (isRed > 0.5) {
          // Eye glows softly in both modes, never blinding
          color = mix(accentColor * 2.0, accentColor * 1.5, uTheme); 
        }

        // Extremely low opacity: 4-8% dark, 6-10% light
        float baseOpacity = mix(0.06, 0.08, uTheme);
        // Spotlight increases opacity slightly in the illuminated area
        float finalOpacity = mask * (baseOpacity + (spotlight * 0.04));

        gl_FragColor = vec4(color, finalOpacity);
      }
    `
  }), [logoTex, accentColor]);

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.getElapsedTime();
      // Very slow, luxurious breathing motion
      group.current.position.x = Math.sin(t * 0.1) * 0.05;
      group.current.position.y = Math.sin(t * 0.15) * 0.05;
    }
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.getElapsedTime();
      matRef.current.uniforms.mouse.value.set(state.mouse.x, state.mouse.y);
      matRef.current.uniforms.uTheme.value = themeObj.current.val;
    }
  });

  // Extremely subtle parallax so it feels like environmental architecture
  React.useEffect(() => {
    if (group.current) {
      const ctx = gsap.context(() => {
        gsap.to(group.current!.position, {
          y: 2, // Slight upward drift as you scroll down
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
          }
        });
      });
      return () => ctx.revert();
    }
  }, []);

  return (
    // Positioned offset to the right as per design reference
    <group ref={group} scale={[14, 14, 1]} position={[3, -1, -2]}>
      <mesh>
        <planeGeometry args={[1, 1, 64, 64]} />
        <shaderMaterial ref={matRef} args={[shader]} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function CinematicFog() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const accentColor = useAccentColor();
  const { theme } = useTheme();
  const themeObj = useRef({ val: theme === "light" ? 1.0 : 0.0 });
  
  useEffect(() => {
    gsap.to(themeObj.current, {
      val: theme === "light" ? 1.0 : 0.0,
      duration: 1.0,
      ease: "power2.inOut"
    });
  }, [theme]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = state.clock.getElapsedTime();
      matRef.current.uniforms.uTheme.value = themeObj.current.val;
    }
  });

  const shader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(accentColor) },
      uTheme: { value: themeObj.current.val }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float uTheme;
      varying vec2 vUv;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 x) {
        vec2 p = floor(x);
        vec2 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(p);
        float b = hash(p + vec2(1.0, 0.0));
        float c = hash(p + vec2(0.0, 1.0));
        float d = hash(p + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 uv = vUv * 3.0;
        float n = noise(uv + vec2(time * 0.1, time * -0.2));
        n += noise(uv * 2.0 - vec2(time * 0.2, time * 0.1)) * 0.5;
        
        float dist = distance(vUv, vec2(0.5));
        
        // Fog is extremely subtle
        float maxAlpha = mix(0.08, 0.03, uTheme);
        float alpha = smoothstep(0.5, 0.0, dist) * n * maxAlpha;
        
        // Fog color
        vec3 fogColor = mix(vec3(0.05, 0.05, 0.06), vec3(0.95, 0.9, 0.9), uTheme);
        
        gl_FragColor = vec4(fogColor, alpha);
      }
    `
  }), [accentColor]);

  return (
    <mesh position={[0, 0, 2]}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial ref={matRef} args={[shader]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export function CinematicBullCanvas() {
  return (
    // Fixed completely in the background
    <div className="fixed inset-0 z-0 pointer-events-none">
      <React.Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.1} />
          <ArchitecturalBullTexture />
          <CinematicFog />
        </Canvas>
      </React.Suspense>
    </div>
  );
}
