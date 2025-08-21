'use client'

import React, { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { authApi, ApiError } from '@/lib/api';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (userData: UserFormData) => void;
  onSuccess?: (userData: UserFormData) => void; // Called when user is successfully created
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  monthly_fee: number;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  monthly_fee?: string;
}

export default function CreateUserModal({ isOpen, onClose, onSave, onSuccess }: CreateUserModalProps) {
  const { theme, colors } = useTheme();
  const { language } = useLanguage();
  const { gym } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<UserFormData>(() => ({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    monthly_fee: gym?.monthly_fee || 25000
  }));

  // Update monthly_fee when gym changes or modal opens
  React.useEffect(() => {
    if (gym?.monthly_fee && isOpen) {
      setFormData(prev => ({ ...prev, monthly_fee: gym.monthly_fee }));
    }
  }, [gym?.monthly_fee, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = language === 'es' ? 'El nombre es requerido' : 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = language === 'es' ? 'El apellido es requerido' : 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'es' ? 'El email es requerido' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'es' ? 'Email inválido' : 'Invalid email format';
    }

    if (formData.phone && !/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = language === 'es' ? 'Número de teléfono inválido' : 'Invalid phone number';
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16) {
        newErrors.date_of_birth = language === 'es' ? 'Debe ser mayor de 16 años' : 'Must be at least 16 years old';
      }
    }

    if (!formData.monthly_fee || formData.monthly_fee <= 0) {
      newErrors.monthly_fee = language === 'es' ? 'La mensualidad debe ser mayor a 0' : 'Monthly fee must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle monthly_fee as number
    const processedValue = name === 'monthly_fee' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!gym?.id) {
      setErrors({ email: language === 'es' ? 'Error: No se encontró información del gimnasio' : 'Error: Gym information not found' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authApi.createUser({
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone || undefined,
        dateOfBirth: formData.date_of_birth || undefined,
        gymId: gym.id,
        monthlyFee: formData.monthly_fee,
      });

      if (response.success) {
        // Show success message
        const successMsg = language === 'es' 
          ? `Usuario ${response.user?.firstName} ${response.user?.lastName} creado exitosamente. Se ha enviado un email con los detalles de pago.`
          : `User ${response.user?.firstName} ${response.user?.lastName} created successfully. Payment details email has been sent.`;
        
        setSuccessMessage(successMsg);

        // Call callbacks
        onSave?.({
          ...formData,
          email: response.user?.email || formData.email,
          first_name: response.user?.firstName || formData.first_name,
          last_name: response.user?.lastName || formData.last_name,
        });
        
        onSuccess?.({
          ...formData,
          email: response.user?.email || formData.email,
          first_name: response.user?.firstName || formData.first_name,
          last_name: response.user?.lastName || formData.last_name,
        });
        
        // Reset form after a delay to show success message
        setTimeout(() => {
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            monthly_fee: gym?.monthly_fee || 25000
          });
          setSuccessMessage('');
          onClose();
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      let errorMessage = language === 'es' ? 'Error al crear el usuario' : 'Error creating user';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal */}
      <div 
        className="rounded-2xl px-8 pt-8 pb-8 text-left overflow-hidden shadow-2xl transform transition-all max-w-2xl w-full relative"
        style={{ 
          backgroundColor: colors.background,
          border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 
                className="text-3xl font-bold uppercase tracking-wider mb-2" 
                style={{ 
                  fontFamily: 'Romagothic, sans-serif',
                  color: colors.foreground,
                  letterSpacing: '0.15em'
                }}
              >
                {language === 'es' ? 'CREAR NUEVO USUARIO' : 'CREATE NEW USER'}
              </h3>
              <p className="text-base" style={{ color: colors.muted }}>
                {language === 'es' ? 'Agrega un nuevo miembro al gimnasio' : 'Add a new member to the gym'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl transition-all duration-200 group"
              style={{ 
                backgroundColor: 'transparent',
                color: colors.muted,
                border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef444420';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.muted;
                e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div 
              className="mb-6 p-4 rounded-lg border-l-4"
              style={{ 
                backgroundColor: '#10B98120',
                borderColor: '#10B981',
                color: '#065F46'
              }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Monthly Fee Field */}
          <div>
            <label 
              htmlFor="monthly_fee" 
              className="block text-sm font-bold uppercase tracking-widest mb-3" 
              style={{ 
                color: colors.foreground,
                fontFamily: 'Romagothic, sans-serif',
                letterSpacing: '0.1em'
              }}
            >
              {language === 'es' ? 'MENSUALIDAD' : 'MONTHLY FEE'} *
            </label>
            <div className="relative">
              <input
                type="number"
                id="monthly_fee"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleInputChange}
                min="0"
                step="1000"
                placeholder="25000"
                className="w-full px-4 py-4 pr-20 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ 
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  border: `2px solid ${errors.monthly_fee ? '#ef4444' : colors.inputBorder}`,
                  fontSize: '16px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.buttonBackground;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.monthly_fee ? '#ef4444' : colors.inputBorder;
                }}
              />
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, monthly_fee: gym?.monthly_fee || 25000 }));
                    if (errors.monthly_fee) {
                      setErrors(prev => ({ ...prev, monthly_fee: undefined }));
                    }
                  }}
                  className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: colors.buttonBackground, 
                    color: colors.buttonText 
                  }}
                  title={language === 'es' ? 'Restablecer al valor por defecto' : 'Reset to default value'}
                >
                  {language === 'es' ? 'Por defecto' : 'Default'}
                </button>
                <span className="text-sm font-medium" style={{ color: colors.muted }}>
                  CRC
                </span>
              </div>
            </div>
            {errors.monthly_fee && (
              <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                {errors.monthly_fee}
              </p>
            )}
            <p className="mt-2 text-xs" style={{ color: colors.muted }}>
              {language === 'es' 
                ? `Mensualidad por defecto del gimnasio: ${formatCurrency(gym?.monthly_fee || 0)}`
                : `Gym default monthly fee: ${formatCurrency(gym?.monthly_fee || 0)}`
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label 
                  htmlFor="first_name" 
                  className="block text-sm font-bold uppercase tracking-widest mb-3" 
                  style={{ 
                    color: colors.foreground,
                    fontFamily: 'Romagothic, sans-serif',
                    letterSpacing: '0.1em'
                  }}
                >
                  {language === 'es' ? 'NOMBRE' : 'FIRST NAME'} *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    border: `2px solid ${errors.first_name ? '#ef4444' : colors.inputBorder}`,
                    fontSize: '16px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.buttonBackground;
                    e.currentTarget.style.boxShadow = theme === 'dark' 
                      ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
                      : '0 0 0 3px rgba(55, 55, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.first_name ? '#ef4444' : colors.inputBorder;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={language === 'es' ? 'Ingresa el nombre' : 'Enter first name'}
                />
                {errors.first_name && (
                  <p className="text-sm mt-2 font-medium" style={{ color: '#ef4444' }}>
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="last_name" 
                  className="block text-sm font-bold uppercase tracking-widest mb-3" 
                  style={{ 
                    color: colors.foreground,
                    fontFamily: 'Romagothic, sans-serif',
                    letterSpacing: '0.1em'
                  }}
                >
                  {language === 'es' ? 'APELLIDO' : 'LAST NAME'} *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    border: `2px solid ${errors.last_name ? '#ef4444' : colors.inputBorder}`,
                    fontSize: '16px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.buttonBackground;
                    e.currentTarget.style.boxShadow = theme === 'dark' 
                      ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
                      : '0 0 0 3px rgba(55, 55, 55, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.last_name ? '#ef4444' : colors.inputBorder;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={language === 'es' ? 'Ingresa el apellido' : 'Enter last name'}
                />
                {errors.last_name && (
                  <p className="text-sm mt-2 font-medium" style={{ color: '#ef4444' }}>
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2" 
                style={{ color: colors.foreground }}
              >
                {language === 'es' ? 'Correo Electrónico' : 'Email Address'} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  border: `1px solid ${errors.email ? '#ef4444' : colors.inputBorder}`,
                }}
                placeholder={language === 'es' ? 'ejemplo@email.com' : 'example@email.com'}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium mb-2" 
                style={{ color: colors.foreground }}
              >
                {language === 'es' ? 'Teléfono' : 'Phone Number'}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  border: `1px solid ${errors.phone ? '#ef4444' : colors.inputBorder}`,
                }}
                placeholder={language === 'es' ? '+506 8888-1234' : '+506 8888-1234'}
              />
              {errors.phone && (
                <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label 
                htmlFor="date_of_birth" 
                className="block text-sm font-medium mb-2" 
                style={{ color: colors.foreground }}
              >
                {language === 'es' ? 'Fecha de Nacimiento' : 'Date of Birth'}
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.inputBackground,
                  color: colors.inputText,
                  border: `1px solid ${errors.date_of_birth ? '#ef4444' : colors.inputBorder}`,
                }}
              />
              {errors.date_of_birth && (
                <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-6 pt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.muted,
                  border: `2px solid ${colors.inputBorder}`,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.1em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
                  e.currentTarget.style.color = colors.foreground;
                  e.currentTarget.style.borderColor = colors.foreground;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.muted;
                  e.currentTarget.style.borderColor = colors.inputBorder;
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                {language === 'es' ? 'CANCELAR' : 'CANCEL'}
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  backgroundColor: colors.buttonBackground,
                  color: colors.buttonText,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.1em'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = colors.buttonHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme === 'dark' 
                      ? '0 10px 25px rgba(255, 255, 255, 0.1)'
                      : '0 10px 25px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = colors.buttonBackground;
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span className="flex items-center space-x-2">
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>
                    {isLoading 
                      ? (language === 'es' ? 'CREANDO...' : 'CREATING...') 
                      : (language === 'es' ? 'CREAR USUARIO' : 'CREATE USER')
                    }
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}