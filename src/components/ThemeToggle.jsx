"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme-context";

export default function ThemeToggle() {
  const { mode, toggleMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
