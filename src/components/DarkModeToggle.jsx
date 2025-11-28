"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function DarkModeToggle() {
  const { toggleMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="relative p-2.5 rounded-lg transition-all duration-300 ease-out"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        color: "var(--color-text)",
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Animated background transition */}
      <div
        className="absolute inset-0 rounded-lg transition-opacity duration-300"
        style={{
          backgroundColor: "var(--color-primary)",
          opacity: isDark ? 0.1 : 0,
          pointerEvents: "none",
        }}
      />

      {/* Icon container with rotation animation */}
      <div className="relative flex items-center justify-center w-5 h-5">
        {isDark ? (
          <Sun
            className="w-5 h-5 text-yellow-500 animate-spin-slow"
            style={{
              animation: "spin 0.5s ease-out",
            }}
          />
        ) : (
          <Moon
            className="w-5 h-5 text-blue-500 animate-spin-slow"
            style={{
              animation: "spin 0.5s ease-out",
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
}
