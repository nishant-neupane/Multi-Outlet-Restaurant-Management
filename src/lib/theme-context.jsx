"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { applyTheme, getSavedTheme, THEMES } from "./theme-config";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("orange");
  const [mode, setMode] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const saved = getSavedTheme();
    setThemeName(saved.name);
    setMode(saved.mode);
    applyTheme(saved.name, saved.mode);
    setIsLoading(false);
  }, []);

  // Apply theme when changed
  useEffect(() => {
    if (!isLoading) {
      applyTheme(themeName, mode);
    }
  }, [themeName, mode, isLoading]);

  const setTheme = (newThemeName) => {
    setThemeName(newThemeName);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightMode = () => setMode("light");
  const setDarkMode = () => setMode("dark");

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
  };

  if (isLoading) {
    return null; // or a loading spinner
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
