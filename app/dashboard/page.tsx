'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';

export default function DashboardPage() {
  const { isAuthenticated, isGymActive, signOut, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const { colors, logos } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    // If user is authenticated, show dashboard
    // (gym activation will be handled by the actual functionality)
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.accent }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: colors.rightPanelBackground, borderColor: colors.inputBorder }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src={logos.rightIcon}
                alt="Forma"
                width={32}
                height={32}
                className="mr-3"
              />
              <h1 className="text-xl font-bold" style={{ 
                color: colors.rightPanelText,
                fontFamily: 'TestUnifiedSerif, serif'
              }}>
                {t('dashboard')}
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: colors.muted }}>
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  color: colors.rightPanelText,
                  borderColor: colors.inputBorder,
                  backgroundColor: 'transparent'
                }}
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl mb-2" style={{ 
            color: colors.rightPanelText,
            fontFamily: 'TestUnifiedSerif, serif'
          }}>
            {t('welcomeToDashboard')}
          </h2>
          <p className="text-lg" style={{ color: colors.muted }}>
            {t('gymManagementCenter')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg border" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-6 h-6" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold" style={{ color: colors.rightPanelText }}>--</h3>
                <p className="text-sm" style={{ color: colors.muted }}>{t('activeMembers')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-6 h-6" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold" style={{ color: colors.rightPanelText }}>₡--,---</h3>
                <p className="text-sm" style={{ color: colors.muted }}>{t('monthlyRevenue')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-6 h-6" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold" style={{ color: colors.rightPanelText }}>--</h3>
                <p className="text-sm" style={{ color: colors.muted }}>{t('pendingPayments')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('memberManagement')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('memberManagementDesc')}
            </p>
          </div>

          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('paymentProcessing')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('paymentProcessingDesc')}
            </p>
          </div>

          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('analytics')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('analyticsDesc')}
            </p>
          </div>

          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('accessControl')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('accessControlDesc')}
            </p>
          </div>

          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('settings')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('settingsDesc')}
            </p>
          </div>

          <div className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg" style={{ 
            backgroundColor: colors.rightPanelBackground,
            borderColor: colors.inputBorder
          }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: colors.inputBackground }}>
                <svg className="w-8 h-8" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold ml-4" style={{ color: colors.rightPanelText }}>
                {t('support')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('supportDesc')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}