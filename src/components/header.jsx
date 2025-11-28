'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, LogOut, Menu, X, ChevronDown, Palette } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import ThemeSelector from './ThemeSelector';

export default function Header({ userName = 'User', userRole = 'employee' }) {
  const router = useRouter();
  const { mode, toggleMode, themeName } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('token');
    router.push('/');
  };

  const getRoleBadgeColor = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return 'text-white';
      case 'manager':
        return 'text-white';
      case 'employee':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return { backgroundColor: '#2375E0' };
      case 'manager':
        return { backgroundColor: '#4A98FF' };
      case 'employee':
        return { backgroundColor: '#146DE1' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4A98FF 0%, #2375E0 100%)" }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="hidden md:inline font-semibold text-gray-950 dark:text-white">
              Restaurant Management
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Center */}
        <div className="hidden md:flex items-center gap-6"></div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* User Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-950 dark:text-white truncate max-w-xs">
                  {userName}
                </p>
                <p className={`text-xs font-semibold px-2 py-0.5 rounded ${getRoleBadgeColor()}`} style={getRoleBadgeStyle()}>
                  {userRole}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-800 dark:text-gray-100 transition-transform ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-950 dark:text-white">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-800 dark:text-gray-100 capitalize">
                    {userRole}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // TODO: Navigate to profile settings
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    // TODO: Navigate to preferences
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Preferences
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-950 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-gray-950 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="px-4 py-3 space-y-3">
            <div className="pb-3 border-b border-gray-200 dark:border-slate-700">
              <p className="text-sm font-medium text-gray-950 dark:text-white">
                {userName}
              </p>
              <p className={`text-xs font-semibold px-2 py-0.5 rounded w-fit mt-1 ${getRoleBadgeColor()}`} style={getRoleBadgeStyle()}>
                {userRole}
              </p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 rounded transition-colors"
            >
              Profile Settings
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 rounded transition-colors"
            >
              Preferences
            </button>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
