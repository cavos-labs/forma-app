'use client'

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { authApi, ApiError } from "@/lib/api";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({ 
  isOpen, 
  onClose, 
  onBackToLogin 
}: ForgotPasswordModalProps) {
  const { t } = useLanguage();
  const { colors, logos } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.forgotPassword({ email });
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || t('unexpectedError'));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-lg shadow-xl"
        style={{ backgroundColor: colors.rightPanelBackground }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center space-x-3">
            <Image
              src={logos.rightIcon}
              alt="Forma"
              width={32}
              height={32}
            />
            <h2 className="text-xl font-semibold" style={{ 
              color: colors.rightPanelText,
              fontFamily: 'TestUnifiedSerif, serif'
            }}>
              {t('forgotPasswordTitle')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-opacity-10"
            style={{ color: colors.rightPanelText }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <>
              <p className="text-sm mb-6" style={{ color: colors.muted }}>
                {t('forgotPasswordSubtitle')}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `1px solid ${colors.inputBorder}`
                    }}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: colors.buttonBackground,
                    color: colors.buttonText,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = colors.buttonHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = colors.buttonBackground;
                    }
                  }}
                >
                  {isLoading ? t('loading') : t('sendResetLink')}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.buttonBackground}20` }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.buttonBackground }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.rightPanelText }}>
                {t('forgotPasswordTitle')}
              </h3>
              <p className="text-sm mb-6" style={{ color: colors.muted }}>
                {t('forgotPasswordEmailSent')}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm hover:underline"
              style={{ color: colors.rightPanelText }}
            >
              {t('forgotPasswordBackToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}