"use client";

import { useState, useEffect } from "react";
import { HardHat } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const totalDuration = prefersReducedMotion ? 400 : 1500;
    const fadeOutDelay = prefersReducedMotion ? 250 : 1250;

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeOutDelay);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-out select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading NIRMAN"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-orange-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center space-y-4 px-4">
        {/* Animated Brand Logo Squircle */}
        <div className="relative animate-nirman-logo">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-3 rounded-3xl bg-orange-600/25 blur-xl animate-pulse" />

          {/* Logo Container */}
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-2xl shadow-orange-600/40">
            <HardHat className="h-10 w-10 sm:h-12 sm:w-12 animate-nirman-hat" />
          </div>
        </div>

        {/* Animated Brand Text */}
        <div className="flex flex-col items-center space-y-1 text-center animate-nirman-text">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              NIRMAN
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 tracking-wider">
              Tenders
            </span>
          </div>

          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-widest pt-0.5">
            Building Trust • Constructing Tomorrow
          </p>
        </div>

        {/* Sleek Progress Indicator */}
        <div className="w-36 sm:w-44 h-1 bg-muted rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-nirman-progress" />
        </div>
      </div>
    </div>
  );
}
