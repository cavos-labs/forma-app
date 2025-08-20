'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import getStripe from "@/lib/stripe";

export default function PricingPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, colors, logos } = useTheme();
  const { signOut, gym } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isMenuOpening, setIsMenuOpening] = useState(false);
  const router = useRouter();

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

  const handlePlanSelect = async (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setIsProcessing(true);

    console.log('Plan:', plan);
    console.log('Gym object:', gym);
    console.log('Gym ID:', gym?.id);

    // Try to get gym ID from different possible sources
    const gymId = gym?.id || (gym as any)?.gymId || localStorage.getItem('forma_gym_id');
    console.log('Resolved Gym ID:', gymId);

    if (!gymId) {
      alert('Gym information not available. Please try logging in again.');
      setIsProcessing(false);
      setSelectedPlan(null);
      return;
    }

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          gymId: gymId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const result = await stripe?.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert(t('paymentError') || 'Error processing payment. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: t('monthlyPlan'),
      price: t('monthlyPrice'),
      period: t('perMonth'),
      popular: false,
    },
    {
      id: 'yearly',
      name: t('yearlyPlan'),
      price: t('yearlyPrice'),
      period: t('perYear'),
      popular: true,
      discount: t('yearlyDiscount'),
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: colors.background }}>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden flex items-center p-4" style={{ backgroundColor: colors.leftPanelBackground }}>
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
        />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
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
            className={`relative w-80 h-full p-6 transform transition-transform duration-300 ease-out ${
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
              t={t}
              signOut={signOut}
              router={router}
              onClose={handleCloseMenu}
            />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutToLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-delay-0 {
          animation: fadeInUp 0.4s ease-out 0.1s both;
        }

        .animate-fade-in-delay-1 {
          animation: fadeInUp 0.4s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeInUp 0.4s ease-out 0.3s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeInUp 0.4s ease-out 0.4s both;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 lg:min-h-screen p-6 lg:p-8" style={{ backgroundColor: colors.leftPanelBackground }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full mb-4" style={{ 
                backgroundColor: theme === 'dark' ? '#2a2a2a' : 'rgba(240, 240, 240, 0.2)',
                color: colors.leftPanelText
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">{t('gymInactive')}</span>
              </div>
            </div>
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
              {t('backToLogin')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 uppercase tracking-wide" style={{ 
              color: colors.foreground,
              fontFamily: 'Romagothic, sans-serif'
            }}>
              {t('pricingTitle')}
            </h1>
            <p className="text-lg md:text-xl" style={{ color: colors.muted }}>
              {t('activateMessage')}
            </p>
          </div>

          {/* Plans */}
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 md:p-8 border-2 transition-all cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: colors.rightPanelBackground,
                  borderColor: plan.popular ? colors.accent : colors.inputBorder,
                  boxShadow: plan.popular ? `0 10px 30px rgba(0, 0, 0, 0.1)` : '0 4px 20px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => handlePlanSelect(plan.id as 'monthly' | 'yearly')}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 text-xs rounded-full" style={{
                      backgroundColor: colors.accent,
                      color: colors.rightPanelBackground,
                      fontFamily: 'Romagothic, sans-serif'
                    }}>
                      {plan.discount}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl md:text-2xl mb-4 uppercase tracking-wide" style={{ 
                    color: colors.rightPanelText,
                    fontFamily: 'Romagothic, sans-serif'
                  }}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl md:text-4xl" style={{ 
                      color: colors.rightPanelText,
                      fontFamily: 'TestUnifiedSerif, serif'
                    }}>
                      {plan.price}
                    </span>
                    <div className="text-sm md:text-base mt-1" style={{ color: colors.muted }}>
                      {plan.period}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isProcessing && selectedPlan === plan.id}
                  className="w-full py-3 md:py-4 px-4 rounded-xl transition-all disabled:opacity-50 tracking-wide"
                  style={{
                    backgroundColor: plan.popular ? colors.accent : 'transparent',
                    color: plan.popular ? colors.rightPanelBackground : colors.rightPanelText,
                    border: plan.popular ? 'none' : `1px solid ${colors.inputBorder}`,
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.popular && !isProcessing) {
                      e.currentTarget.style.backgroundColor = colors.accent;
                      e.currentTarget.style.color = colors.rightPanelBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.popular && !isProcessing) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.rightPanelText;
                    }
                  }}
                >
                  {isProcessing && selectedPlan === plan.id ? t('processing') : t('choosePlan')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Menu Content Component
function MobileMenuContent({ 
  theme, 
  toggleTheme, 
  language, 
  setLanguage, 
  colors, 
  t, 
  signOut, 
  router, 
  onClose 
}: {
  theme: string;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: 'en' | 'es') => void;
  colors: any;
  t: (key: any) => string;
  signOut: () => Promise<void>;
  router: any;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Close Button */}
      <div className="flex justify-end mb-6 animate-fade-in-delay-0">
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
      <div className="mb-8 animate-fade-in-delay-1">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm">{t('gymInactive')}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-8 animate-fade-in-delay-2">
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
      <div className="mt-auto animate-fade-in-delay-3">
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
          {t('backToLogin')}
        </button>
      </div>
    </div>
  );
}