"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { applyTheme, getSavedTheme, THEMES } from "./theme-config";

const ThemeContext = createContext();

// Detect system preference for dark/light mode
function getSystemColorScheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children, outletTheme = null }) {
  const [themeName, setThemeName] = useState("blue");
  const [mode, setMode] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount and detect system preference
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // Get mode preference (saved or system preference)
    const savedMode = localStorage.getItem("theme-mode");
    const modePreference = savedMode || getSystemColorScheme();
    setMode(modePreference);

    // Get theme: use outlet theme if provided, otherwise use saved theme
    let themeToApply = "blue";
    if (outletTheme && THEMES[outletTheme]) {
      themeToApply = outletTheme;
    } else {
      const saved = getSavedTheme();
      themeToApply = saved.name;
    }

    setThemeName(themeToApply);
    applyTheme(themeToApply, modePreference);
    setIsLoading(false);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only apply system change if user hasn't explicitly saved a preference
      if (!localStorage.getItem("theme-mode")) {
        const newMode = e.matches ? "dark" : "light";
        setMode(newMode);
        applyTheme(themeToApply, newMode);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme when changed
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      applyTheme(themeName, mode);
    }
  }, [themeName, mode, isLoading]);

  const setTheme = (newThemeName) => {
    if (THEMES[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", newMode);
      return newMode;
    });
  };

  const setLightMode = () => {
    setMode("light");
    localStorage.setItem("theme-mode", "light");
  };

  const setDarkMode = () => {
    setMode("dark");
    localStorage.setItem("theme-mode", "dark");
  };

  const value = {
    themeName,
    mode,
    setTheme,
    toggleMode,
    setLightMode,
    setDarkMode,
    isDark: mode === "dark",
    isLight: mode === "light",
    themes: THEMES,
    outletTheme,
    getSystemColorScheme,
  };

  if (isLoading) {
    // Return a placeholder that won't cause issues
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
