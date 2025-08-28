'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Sidebar({ 
  activeSection = "memberships",
  onSectionChange 
}: SidebarProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { gym, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isMenuOpening, setIsMenuOpening] = useState(false);

  const handleOpenMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // Trigger opening animation
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMenuOpening(true);
      const timer = setTimeout(() => {
        setIsMenuOpening(false);
      }, 50); // Small delay to allow DOM to render
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 300); // Match animation duration
  };

  const menuItems = [
    {
      id: 'memberships',
      label: language === 'es' ? 'MEMBRESÍAS' : 'MEMBERSHIPS'
    },
    {
      id: 'payments',
      label: language === 'es' ? 'PAGOS' : 'PAYMENTS'
    },
    {
      id: 'classes',
      label: language === 'es' ? 'ENTRENAMIENTOS' : 'WORKOUTS'
    }
  ];

  return (
    <>
      {/* Mobile Header with Hamburger - Fixed at top */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 shadow-sm" style={{ backgroundColor: colors.leftPanelBackground }}>
        <div className="flex items-center">
          <button
            onClick={() => isMobileMenuOpen ? handleCloseMenu() : handleOpenMenu()}
            className="p-2 rounded-lg transition-all duration-300 mr-3 hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(240, 240, 240, 0.2)',
              color: colors.leftPanelText
            }}
          >
            <div className="relative w-6 h-6">
              <svg 
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-75'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
          <Image
            src={'/images/forma-icon-white.png'}
            alt="Forma"
            width={32}
            height={32}
            className="mr-3"
          />
        </div>
        
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop with fade in/out */}
          <div 
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out ${
              isMenuClosing ? 'opacity-0' : isMenuOpening ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleCloseMenu}
          />
          {/* Sidebar with slide in/out from left */}
          <div 
            className={`relative w-72 h-full p-4 transform transition-transform duration-300 ease-out ${
              isMenuClosing 
                ? '-translate-x-full' 
                : isMenuOpening 
                  ? '-translate-x-full' 
                  : 'translate-x-0'
            }`}
            style={{ backgroundColor: colors.leftPanelBackground }}
          >
            <MobileMenuContent 
              theme={theme}
              toggleTheme={toggleTheme}
              language={language}
              setLanguage={setLanguage}
              colors={colors}
              gym={gym}
              signOut={signOut}
              router={router}
              onClose={handleCloseMenu}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              menuItems={menuItems}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 lg:min-h-screen fixed left-0 top-0 h-full p-6 lg:p-8" style={{ backgroundColor: colors.leftPanelBackground }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <Image
              src={'/images/forma-icon-white.png'}
              alt="Forma"
              width={40}
              height={40}
              className="mb-6"
            />
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full mb-4" style={{ 
                backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)',
                color: colors.leftPanelText
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{gym?.name || 'Gym Active'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="mb-8">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange?.(item.id)}
                  className="w-full text-left py-3 px-4 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: activeSection === item.id 
                      ? 'rgba(240, 240, 240, 0.2)' 
                      : 'transparent',
                    color: colors.leftPanelText,
                    fontFamily: 'Romagothic, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(240, 240, 240, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span className="text-base font-medium uppercase tracking-wide">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Controls */}
          <div className="space-y-4 mb-8 lg:mb-12">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.leftPanelText }}>
                {theme === 'dark' ? 'Dark' : 'Light'} Theme
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all"
                style={{ 
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)',
                  color: colors.leftPanelText
                }}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.leftPanelText }}>Language</span>
              <div className="flex rounded-lg p-1" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)' }}>
                <button
                  onClick={() => setLanguage('en')}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{
                    backgroundColor: language === 'en' ? colors.leftPanelText : 'transparent',
                    color: language === 'en' ? colors.leftPanelBackground : colors.leftPanelText
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{
                    backgroundColor: language === 'es' ? colors.leftPanelText : 'transparent',
                    color: language === 'es' ? colors.leftPanelBackground : colors.leftPanelText
                  }}
                >
                  ES
                </button>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-auto">
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="w-full px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'transparent',
                color: colors.leftPanelText,
                border: `1px solid rgba(240, 240, 240, 0.3)`
              }}
            >
              {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile Menu Content Component
function MobileMenuContent({ 
  theme, 
  toggleTheme, 
  language, 
  setLanguage, 
  colors, 
  gym,
  signOut, 
  router, 
  onClose,
  activeSection,
  onSectionChange,
  menuItems
}: {
  theme: string;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: 'en' | 'es') => void;
  colors: Record<string, string>;
  gym: { name?: string } | null;
  signOut: () => Promise<void>;
  router: { push: (path: string) => void };
  onClose: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  menuItems: { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Close Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ 
            backgroundColor: 'rgba(240, 240, 240, 0.2)',
            color: colors.leftPanelText
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <Image
          src={'/images/forma-icon-white.png'}
          alt="Forma"
          width={32}
          height={32}
          className="mb-4"
        />
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs" style={{ 
          backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)',
          color: colors.leftPanelText
        }}>
          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{gym?.name || 'Gym Active'}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="mb-8">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange?.(item.id);
                onClose();
              }}
              className="w-full text-left py-3 px-4 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: activeSection === item.id 
                  ? 'rgba(240, 240, 240, 0.2)' 
                  : 'transparent',
                color: colors.leftPanelText,
                fontFamily: 'Romagothic, sans-serif'
              }}
            >
              <span className="text-base font-medium uppercase tracking-wide">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-8">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: colors.leftPanelText }}>
            {theme === 'dark' ? 'Dark' : 'Light'} Theme
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all"
            style={{ 
              backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)',
              color: colors.leftPanelText
            }}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: colors.leftPanelText }}>Language</span>
          <div className="flex rounded-lg p-1" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)' }}>
            <button
              onClick={() => setLanguage('en')}
              className="px-2 py-1 rounded text-xs transition-all"
              style={{
                backgroundColor: language === 'en' ? colors.leftPanelText : 'transparent',
                color: language === 'en' ? colors.leftPanelBackground : colors.leftPanelText
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('es')}
              className="px-2 py-1 rounded text-xs transition-all"
              style={{
                backgroundColor: language === 'es' ? colors.leftPanelText : 'transparent',
                color: language === 'es' ? colors.leftPanelBackground : colors.leftPanelText
              }}
            >
              ES
            </button>
          </div>
        </div>
      </div>

      {/* Back to Login */}
      <div className="mt-auto">
        <button
          onClick={async () => {
            onClose(); // Close menu with animation first
            setTimeout(async () => {
              await signOut();
              router.push('/');
            }, 300); // Wait for menu to close
          }}
          className="w-full px-4 py-3 rounded-lg text-sm transition-all hover:scale-105"
          style={{
            backgroundColor: 'transparent',
            color: colors.leftPanelText,
            border: `1px solid rgba(240, 240, 240, 0.3)`
          }}
        >
          {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}