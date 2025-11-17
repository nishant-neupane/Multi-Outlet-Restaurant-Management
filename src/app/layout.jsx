import React from "react";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import { ThemeProvider } from "../lib/theme-context";
import Toaster from "../components/Toaster";

export const metadata = {
  title: "Restaurant Management System",
  description: "Multi-outlet restaurant management system",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
