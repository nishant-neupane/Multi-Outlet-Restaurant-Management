"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "../lib/theme-context";

export default function Toaster() {
  const { isDark } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      theme={isDark ? "dark" : "light"}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f1f5f9" : "#111827",
          border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
        },
      }}
    />
  );
}
