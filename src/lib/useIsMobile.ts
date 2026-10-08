"use client";

import { useEffect, useState } from "react";

/**
 * Shared mobile/low-power-device detection hook.
 *
 * Used by WebGL/Three.js components (HeroCanvas, BullWatermark,
 * CinematicBull, NavLogo3D) to cap device pixel ratio and reduce
 * animation/geometry complexity on phones, where full-DPR full-screen
 * WebGL rendering is a common cause of jank, battery drain, and heat.
 *
 * Defaults to `false` on the server/first render to avoid hydration
 * mismatches, then corrects on mount.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mql.matches);

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
