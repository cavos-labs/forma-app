'use client'

import { useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000,
}: SuccessModalProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-6 w-full max-w-sm mx-auto transform transition-all duration-300 ease-out"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
            style={{
              backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
            }}
          >
            {type === 'success' ? (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-xl font-bold text-center mb-2 uppercase tracking-wide"
          style={{
            color: colors.text,
            fontFamily: 'Romagothic, sans-serif',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className="text-sm text-center mb-6 leading-relaxed"
          style={{ color: colors.mutedText }}
        >
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: colors.buttonBackground,
            color: colors.buttonText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonBackground;
          }}
        >
          {language === 'es' ? 'Entendido' : 'Got it'}
        </button>

        {/* Auto-close indicator */}
        {autoClose && (
          <div className="mt-4">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.muted }}
            >
              <div
                className="h-full bg-green-500 rounded-full animate-pulse"
                style={{
                  animation: `shrink ${autoCloseDelay}ms linear forwards`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}