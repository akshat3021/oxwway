"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Loader } from "./Loader";

const BOOT_KEY = "oxway_booted";

/**
 * Shows the brand boot sequence once per browser session (first homepage
 * visit) instead of on every load. The page content is always present in the
 * HTML underneath; the inline script in layout.tsx covers it with a
 * background until this component takes over.
 */
export function BootGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let booted = false;
    try {
      booted = !!sessionStorage.getItem(BOOT_KEY);
    } catch {
      booted = true; // storage unavailable: never block the page
    }
    if (booted) {
      document.documentElement.removeAttribute("data-boot");
    } else {
      // Reads browser-only storage, so it can only run after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
    }
  }, []);

  // Drop the temporary cover only once the Loader overlay is on screen.
  useLayoutEffect(() => {
    if (show) document.documentElement.removeAttribute("data-boot");
  }, [show]);

  const handleComplete = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }, []);

  return show ? <Loader onComplete={handleComplete} /> : null;
}
