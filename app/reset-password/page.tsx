'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { authApi, ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  const { language, t } = useLanguage();
  const { colors, logos } = useTheme();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL hash fragment (Supabase uses hash instead of query params)
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.substring(1)); // Remove the # symbol
    
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      // Store the tokens for the API call
      setToken(JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }));
    } else {
      setError("Invalid or missing reset token");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      if (!token) {
        setError("Invalid or missing reset token");
        setIsLoading(false);
        return;
      }

      // Parse the token data
      const tokenData = JSON.parse(token);
      const response = await authApi.resetPassword({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        password: password
      });
      
      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: colors.buttonBackground }}></div>
          <p style={{ color: colors.muted }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: colors.background }}>
      {/* Left Side - Inspirational Content (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1" style={{ backgroundColor: colors.leftPanelBackground }}>
        <div className="relative z-10 flex flex-col justify-center h-full p-8 xl:p-16" style={{ color: colors.leftPanelText }}>
          <div className="max-w-lg">
            {/* Forma Logo */}
            <div className="mb-8 xl:mb-12">
              <Image 
                src={logos.leftLogo}
                alt="FORMA"
                width={200}
                height={100}
                className="h-16 xl:h-24 mb-6 xl:mb-8"
              />
            </div>
            
            <p className="text-lg xl:text-xl opacity-90 leading-relaxed mb-8 xl:mb-12">
              {t('formaDescription')}
            </p>

            {/* Features List */}
            <div className="space-y-3 xl:space-y-4">
              {(language === 'es' ? [
                'Gestión de membresías',
                'Pagos SINPE automatizados',
                'Análisis en tiempo real',
                'Control de acceso'
              ] : [
                'Membership management',
                'Automated SINPE payments', 
                'Real-time analytics',
                'Access control'
              ]).map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 xl:space-x-4 opacity-90">
                  <div className="w-2 h-2 xl:w-3 xl:h-3 rounded-full" style={{ backgroundColor: colors.leftPanelText }}></div>
                  <span className="text-base xl:text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ backgroundColor: colors.rightPanelBackground }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo (Only visible on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src={logos.rightIcon}
              alt="Forma"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
          </div>

          {/* Forma Logo (Desktop only) */}
          <div className="hidden lg:block text-center mb-8">
            <Image
              src={logos.rightIcon}
              alt="Forma"
              width={60}
              height={60}
              className="mx-auto mb-6 sm:mb-8"
            />
            <h2 className="text-2xl sm:text-3xl mb-2" style={{ 
              fontFamily: 'TestUnifiedSerif, serif',
              color: colors.rightPanelText
            }}>
              {t('resetPasswordTitle')}
            </h2>
            <p className="text-sm sm:text-base" style={{ color: colors.muted }}>
              {t('resetPasswordSubtitle')}
            </p>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden text-center mb-6">
            <h2 className="text-xl sm:text-2xl mb-2" style={{ 
              fontFamily: 'TestUnifiedSerif, serif',
              color: colors.rightPanelText
            }}>
              {t('resetPasswordTitle')}
            </h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {t('resetPasswordSubtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('resetPasswordSuccess')}
              </div>
            </div>
          )}

          {/* Reset Password Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent pr-12"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `1px solid ${colors.inputBorder}`
                    }}
                    placeholder={t('resetPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent pr-12"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `1px solid ${colors.inputBorder}`
                    }}
                    placeholder={t('confirmPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
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
                {isLoading ? t('loading') : t('resetPasswordButton')}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.buttonBackground}20` }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.buttonBackground }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm mb-6" style={{ color: colors.muted }}>
                {language === 'es' ? 'Redirigiendo al login...' : 'Redirecting to login...'}
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
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