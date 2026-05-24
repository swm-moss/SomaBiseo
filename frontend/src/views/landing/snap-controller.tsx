"use client";

import { useEffect } from "react";

export function LandingSnapController() {
  useEffect(() => {
    const features = document.getElementById("features");
    if (!features) return;

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPastTop =
          entry.isIntersecting || entry.boundingClientRect.top < 0;
        if (isPastTop) {
          root.classList.add("sb-landing-snap-active");
        } else {
          root.classList.remove("sb-landing-snap-active");
        }
      },
      { rootMargin: "0px 0px -100% 0px", threshold: 0 },
    );

    observer.observe(features);

    return () => {
      observer.disconnect();
      root.classList.remove("sb-landing-snap-active");
    };
  }, []);

  return null;
}
