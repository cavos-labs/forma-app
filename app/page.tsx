'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { authApi, ApiError } from "@/lib/api";

export default function AuthPage() {
  const { signIn, isLoading: authLoading, error: authError, clearError, isAuthenticated, isGymActive } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, colors, logos } = useTheme();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gymName: '',
    gymAddress: '',
    gymPhone: '',
    gymEmail: '',
    monthlyFee: '',
    sinpePhone: ''
  });

  const isLoading = authLoading;
  const error = authError || localError;

  // Check gym status after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasRedirected) {
      if (!isGymActive) {
        // Redirect to pricing if gym is inactive
        setHasRedirected(true);
        router.push('/pricing');
      } else {
        // Redirect to dashboard if gym is active
        setHasRedirected(true);
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isGymActive, isLoading, hasRedirected, router]);

  // Reset redirect flag when user logs out or changes
  useEffect(() => {
    if (!isAuthenticated) {
      setHasRedirected(false);
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    if (error) {
      clearError();
      setLocalError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearError();

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password, rememberMe);
        // Navigation will be handled by the auth context or a separate effect
      } else {
        const response = await authApi.signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gymName: formData.gymName,
          gymAddress: formData.gymAddress,
          gymPhone: formData.gymPhone,
          gymEmail: formData.gymEmail,
          monthlyFee: formData.monthlyFee,
          sinpePhone: formData.sinpePhone,
        });

        if (response.success) {
          setSuccessMessage(response.message || t('accountCreatedSuccess'));
          setIsLogin(true);
          // Clear form
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            gymName: '',
            gymAddress: '',
            gymPhone: '',
            gymEmail: '',
            monthlyFee: '',
            sinpePhone: ''
          });
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setLocalError(err.message);
      } else {
        setLocalError(t('unexpectedError'));
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      gymName: '',
      gymAddress: '',
      gymPhone: '',
      gymEmail: '',
      monthlyFee: '',
      sinpePhone: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: colors.background }}>
      {/* Left Side - Inspirational Content (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1" style={{ backgroundColor: colors.leftPanelBackground }}>
        {/* Content */}
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

      {/* Right Side - Auth Form */}
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

          {/* Controls */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all"
              style={{ 
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f3f4f6',
                color: colors.rightPanelText
              }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Language Selector */}
            <div className="flex rounded-lg p-1" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f3f4f6' }}>
              <button
                onClick={() => setLanguage('en')}
                className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all"
                style={{
                  backgroundColor: language === 'en' ? colors.rightPanelBackground : 'transparent',
                  color: colors.rightPanelText,
                  boxShadow: language === 'en' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all"
                style={{
                  backgroundColor: language === 'es' ? colors.rightPanelBackground : 'transparent',
                  color: colors.rightPanelText,
                  boxShadow: language === 'es' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                ES
              </button>
            </div>
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
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="text-sm sm:text-base" style={{ color: colors.muted }}>
              {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
            </p>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden text-center mb-6">
            <h2 className="text-xl sm:text-2xl mb-2" style={{ 
              fontFamily: 'TestUnifiedSerif, serif',
              color: colors.rightPanelText
            }}>
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="text-sm" style={{ color: colors.muted }}>
              {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                      placeholder={t('firstNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                      placeholder={t('lastNamePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gymName" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                    {t('gymName')}
                  </label>
                  <input
                    type="text"
                    id="gymName"
                    name="gymName"
                    value={formData.gymName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `1px solid ${colors.inputBorder}`,
                    }}
                    placeholder={t('gymNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="gymAddress" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                    {t('gymAddress')}
                  </label>
                  <input
                    type="text"
                    id="gymAddress"
                    name="gymAddress"
                    value={formData.gymAddress}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `1px solid ${colors.inputBorder}`,
                    }}
                    placeholder={t('gymAddressPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gymPhone" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('gymPhone')}
                    </label>
                    <input
                      type="tel"
                      id="gymPhone"
                      name="gymPhone"
                      value={formData.gymPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                      placeholder={t('gymPhonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="gymEmail" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('gymEmail')}
                    </label>
                    <input
                      type="email"
                      id="gymEmail"
                      name="gymEmail"
                      value={formData.gymEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`,
                      }}
                      placeholder={t('gymEmailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="monthlyFee" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('monthlyFee')}
                    </label>
                    <input
                      type="number"
                      id="monthlyFee"
                      name="monthlyFee"
                      value={formData.monthlyFee}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`
                      }}
                      placeholder={t('monthlyFeePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="sinpePhone" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                      {t('sinpePhone')}
                    </label>
                    <input
                      type="tel"
                      id="sinpePhone"
                      name="sinpePhone"
                      value={formData.sinpePhone}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `1px solid ${colors.inputBorder}`
                      }}
                      placeholder={t('sinpePhonePlaceholder')}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: colors.rightPanelText }}>
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent pr-12"
                  style={{
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    border: `1px solid ${colors.inputBorder}`
                  }}
                  placeholder={t('passwordPlaceholder')}
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

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ 
                      accentColor: '#373737'
                    }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: colors.rightPanelText }}>
                    {t('rememberMe')}
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: colors.rightPanelText }}
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

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
              {isLoading ? t('loading') : (isLogin ? t('signIn') : t('createAccountButton'))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: colors.muted }}>
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium hover:underline"
                style={{ color: colors.rightPanelText }}
              >
                {isLogin ? t('signUp') : t('signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
