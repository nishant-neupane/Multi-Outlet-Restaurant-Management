/**
 * Theme Configuration
 * Defines color schemes for different outlets and dark/light modes
 */

export const THEMES = {
  orange: {
    name: "Orange Sunrise",
    light: {
      primary: "#ea580c",      // orange-600
      primaryHover: "#c2410c", // orange-700
      primaryLight: "#fed7aa", // orange-200
      accent: "#fb923c",       // orange-400
      accentLight: "#ffedd5",  // orange-100
      success: "#16a34a",      // green-600
      warning: "#eab308",      // yellow-500
      error: "#dc2626",        // red-600
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#fb923c",      // orange-400
      primaryHover: "#f97316", // orange-500
      primaryLight: "#7c2d12", // orange-900
      accent: "#ea580c",       // orange-600
      accentLight: "#431407",  // orange-950
      success: "#22c55e",      // green-500
      warning: "#facc15",      // yellow-400
      error: "#ef4444",        // red-500
      background: "#0f172a",   // slate-900
      surface: "#1e293b",      // slate-800
      border: "#334155",       // slate-700
      text: "#f1f5f9",         // slate-100
      textLight: "#cbd5e1",    // slate-300
      textMuted: "#64748b",    // slate-500
    },
  },
  green: {
    name: "Fresh Green",
    light: {
      primary: "#16a34a",      // green-600
      primaryHover: "#15803d", // green-700
      primaryLight: "#bbf7d0", // green-200
      accent: "#22c55e",       // green-500
      accentLight: "#dcfce7",  // green-100
      success: "#16a34a",      // green-600
      warning: "#eab308",      // yellow-500
      error: "#dc2626",        // red-600
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#22c55e",      // green-500
      primaryHover: "#16a34a", // green-600
      primaryLight: "#14532d", // green-900
      accent: "#4ade80",       // green-400
      accentLight: "#052e16",  // green-950
      success: "#22c55e",      // green-500
      warning: "#facc15",      // yellow-400
      error: "#ef4444",        // red-500
      background: "#0f172a",   // slate-900
      surface: "#1e293b",      // slate-800
      border: "#334155",       // slate-700
      text: "#f1f5f9",         // slate-100
      textLight: "#cbd5e1",    // slate-300
      textMuted: "#64748b",    // slate-500
    },
  },
  blue: {
    name: "Ocean Blue",
    light: {
      primary: "#2563eb",      // blue-600
      primaryHover: "#1d4ed8", // blue-700
      primaryLight: "#bfdbfe", // blue-200
      accent: "#3b82f6",       // blue-500
      accentLight: "#dbeafe",  // blue-100
      success: "#16a34a",      // green-600
      warning: "#eab308",      // yellow-500
      error: "#dc2626",        // red-600
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#3b82f6",      // blue-500
      primaryHover: "#2563eb", // blue-600
      primaryLight: "#1e3a8a", // blue-900
      accent: "#60a5fa",       // blue-400
      accentLight: "#172554",  // blue-950
      success: "#22c55e",      // green-500
      warning: "#facc15",      // yellow-400
      error: "#ef4444",        // red-500
      background: "#0f172a",   // slate-900
      surface: "#1e293b",      // slate-800
      border: "#334155",       // slate-700
      text: "#f1f5f9",         // slate-100
      textLight: "#cbd5e1",    // slate-300
      textMuted: "#64748b",    // slate-500
    },
  },
  purple: {
    name: "Royal Purple",
    light: {
      primary: "#9333ea",      // purple-600
      primaryHover: "#7e22ce", // purple-700
      primaryLight: "#e9d5ff", // purple-200
      accent: "#a855f7",       // purple-500
      accentLight: "#f3e8ff",  // purple-100
      success: "#16a34a",      // green-600
      warning: "#eab308",      // yellow-500
      error: "#dc2626",        // red-600
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#a855f7",      // purple-500
      primaryHover: "#9333ea", // purple-600
      primaryLight: "#581c87", // purple-900
      accent: "#c084fc",       // purple-400
      accentLight: "#3b0764",  // purple-950
      success: "#22c55e",      // green-500
      warning: "#facc15",      // yellow-400
      error: "#ef4444",        // red-500
      background: "#0f172a",   // slate-900
      surface: "#1e293b",      // slate-800
      border: "#334155",       // slate-700
      text: "#f1f5f9",         // slate-100
      textLight: "#cbd5e1",    // slate-300
      textMuted: "#64748b",    // slate-500
    },
  },
  red: {
    name: "Vibrant Red",
    light: {
      primary: "#dc2626",      // red-600
      primaryHover: "#b91c1c", // red-700
      primaryLight: "#fecaca", // red-200
      accent: "#ef4444",       // red-500
      accentLight: "#fee2e2",  // red-100
      success: "#16a34a",      // green-600
      warning: "#eab308",      // yellow-500
      error: "#dc2626",        // red-600
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#ef4444",      // red-500
      primaryHover: "#dc2626", // red-600
      primaryLight: "#7f1d1d", // red-900
      accent: "#f87171",       // red-400
      accentLight: "#450a0a",  // red-950
      success: "#22c55e",      // green-500
      warning: "#facc15",      // yellow-400
      error: "#ef4444",        // red-500
      background: "#0f172a",   // slate-900
      surface: "#1e293b",      // slate-800
      border: "#334155",       // slate-700
      text: "#f1f5f9",         // slate-100
      textLight: "#cbd5e1",    // slate-300
      textMuted: "#64748b",    // slate-500
    },
  },
};

/**
 * Get theme colors based on theme name and mode
 */
export function getThemeColors(themeName = "orange", mode = "light") {
  const theme = THEMES[themeName] || THEMES.orange;
  return theme[mode] || theme.light;
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(themeName, mode) {
  const colors = getThemeColors(themeName, mode);
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Store in localStorage
  localStorage.setItem("theme-name", themeName);
  localStorage.setItem("theme-mode", mode);
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme() {
  return {
    name: localStorage.getItem("theme-name") || "orange",
    mode: localStorage.getItem("theme-mode") || "light",
  };
}
