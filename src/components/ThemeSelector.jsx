"use client";

import { Palette } from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { useState } from "react";

export default function ThemeSelector() {
  const { themeName, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { value: "blue", label: "Professional Blue", color: "#2375E0" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors flex items-center gap-2"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
        title="Change Theme"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {themeOptions.find((t) => t.value === themeName)?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-20 overflow-hidden"
            style={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Select Theme
              </p>
            </div>
            <div className="py-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => {
                    setTheme(theme.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 transition-colors hover:opacity-80"
                  style={{
                    backgroundColor:
                      themeName === theme.value
                        ? "var(--color-surface)"
                        : "transparent",
                    color: "var(--color-text)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-sm font-medium">{theme.label}</span>
                  {themeName === theme.value && (
                    <span className="ml-auto text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
