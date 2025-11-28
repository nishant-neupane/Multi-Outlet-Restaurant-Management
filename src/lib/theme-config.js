/**
 * Theme Configuration
 * Defines color schemes for different outlets and dark/light modes
 */

export const THEMES = {
  blue: {
    name: "Professional Blue",
    light: {
      primary: "#2375E0",      // primary blue
      primaryHover: "#146DE1", // dark blue
      primaryLight: "#4A98FF", // light blue
      accent: "#2375E0",       // primary blue
      accentLight: "#4A98FF",  // light blue
      success: "#2375E0",      // blue
      warning: "#146DE1",      // dark blue
      error: "#146DE1",        // dark blue
      background: "#ffffff",
      surface: "#f9fafb",      // gray-50
      border: "#e5e7eb",       // gray-200
      text: "#111827",         // gray-900
      textLight: "#6b7280",    // gray-500
      textMuted: "#9ca3af",    // gray-400
    },
    dark: {
      primary: "#4A98FF",      // light blue
      primaryHover: "#2375E0", // primary blue
      primaryLight: "#146DE1", // dark blue
      accent: "#4A98FF",       // light blue
      accentLight: "#2375E0",  // primary blue
      success: "#4A98FF",      // light blue
      warning: "#2375E0",      // primary blue
      error: "#146DE1",        // dark blue
      background: "#0f1419",   // dark blue-gray
      surface: "#1a1f2e",      // elevated surface
      border: "#2d3748",       // gray
      text: "#f0f4f8",         // soft white
      textLight: "#cbd5e1",    // light gray
      textMuted: "#94a3b8",    // muted gray
    },
  },
};

/**
 * Get theme colors based on theme name and mode
 */
export function getThemeColors(themeName = "blue", mode = "light") {
  const theme = THEMES[themeName] || THEMES.blue;
  return theme[mode] || theme.light;
}

/**
 * Apply theme to CSS variables and handle dark mode class
 */
export function applyTheme(themeName, mode) {
  const colors = getThemeColors(themeName, mode);
  const root = document.documentElement;

  // Apply color variables
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Apply dark mode class to html element
  if (mode === "dark") {
    root.classList.add("dark");
    // Apply gradient background for dark mode
    const gradient = `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 50%, ${colors.background} 100%)`;
    root.style.background = gradient;
    root.style.backgroundAttachment = "fixed";
  } else {
    root.classList.remove("dark");
    root.style.background = "none";
    root.style.backgroundColor = colors.background;
  }

  // Apply to body as well
  if (document.body) {
    if (mode === "dark") {
      const gradient = `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 50%, ${colors.background} 100%)`;
      document.body.style.background = gradient;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.color = colors.text;
    } else {
      document.body.style.backgroundColor = colors.background;
      document.body.style.background = "none";
      document.body.style.color = colors.text;
    }
  }

  // Store in localStorage
  localStorage.setItem("theme-name", themeName);
  localStorage.setItem("theme-mode", mode);
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme() {
  return {
    name: localStorage.getItem("theme-name") || "blue",
    mode: localStorage.getItem("theme-mode") || "light",
  };
}
