'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';

export default function SuccessPage() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { user, gym, refreshGymStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/pricing');
      return;
    }

    // Activate gym after successful payment
    const activateGym = async () => {
      // Get gym ID from URL parameters first, fallback to auth context
      const gymId = searchParams.get('gym_id') || gym?.id;
      
      if (!gymId) {
        console.error('No gym ID found in URL or auth context');
        setIsProcessing(false);
        return;
      }

      try {
        console.log('🔥 Calling activate gym API for gym:', gymId);
        
        const response = await fetch('https://formacr.com/api/gym/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'pQ7xLm9Yt3ZaVr4Jf8HwC2sN6eDqRb1K',
          },
          body: JSON.stringify({
            gymId: gymId
          })
        });

        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
          console.log('✅ Gym activated successfully:', data);
          // Update local auth context with active gym status
          await refreshGymStatus();
        } else {
          console.error('❌ Failed to activate gym:', data.error);
        }
      } catch (error) {
        console.error('💥 Error activating gym:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Wait a moment then activate gym
    const timer = setTimeout(activateGym, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, router, gym]);

  const handleContinue = () => {
    // After successful payment and gym activation, go directly to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src="/images/forma-logo-white.png"
            alt="Forma"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
        </div>

        {isProcessing ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-6" style={{ borderColor: colors.accent }}></div>
            <h1 className="text-2xl mb-4" style={{ color: colors.foreground, fontFamily: 'Romagothic, sans-serif' }}>
              {t('processingPayment')}
            </h1>
            <p style={{ color: colors.muted }}>
              {t('pleaseWait')}
            </p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#10B981' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl mb-4 uppercase" style={{ color: colors.foreground, fontFamily: 'Romagothic, sans-serif' }}>
              {t('paymentSuccessful')}
            </h1>
            
            <p className="text-lg mb-8" style={{ color: colors.muted }}>
              {t('gymActivated')}
            </p>

            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 rounded-lg text-white transition-all"
              style={{ backgroundColor: colors.accent }}
            >
              {t('continueToDashboard')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}