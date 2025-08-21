'use client'

import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  paymentInfo?: {
    amount?: number;
    date?: string;
    reference?: string;
    phone?: string;
  };
}

export default function ReceiptModal({ isOpen, onClose, imageUrl, paymentInfo }: ReceiptModalProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const t = (es: string, en: string) => language === 'es' ? es : en;

  const formatCurrency = (amount: number) => {
    const locale = language === 'es' ? 'es-CR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'es' ? 'es-CR' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
      <div 
        className="bg-white rounded-lg max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden flex flex-col animate-scale-in"
        style={{ backgroundColor: colors.card }}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 sm:p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex-1 pr-4">
            <h2 className="text-lg sm:text-xl font-semibold" style={{ color: colors.foreground }}>
              {t('Comprobante', 'Receipt')}
            </h2>
            {paymentInfo && (
              <div className="mt-2 space-y-1 text-xs sm:text-sm" style={{ color: colors.foreground, opacity: 0.8 }}>
                {paymentInfo.amount && (
                  <p><strong>{t('Monto:', 'Amount:')} </strong>{formatCurrency(paymentInfo.amount)}</p>
                )}
                {paymentInfo.date && (
                  <p><strong>{t('Fecha:', 'Date:')} </strong>{formatDate(paymentInfo.date)}</p>
                )}
                {paymentInfo.reference && (
                  <p className="truncate"><strong>{t('Ref:', 'Ref:')} </strong>{paymentInfo.reference}</p>
                )}
                {paymentInfo.phone && (
                  <p><strong>{t('Tel:', 'Phone:')} </strong>{paymentInfo.phone}</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{ color: colors.foreground }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              {!imageError ? (
                <Image 
                  src={imageUrl}
                  alt={t('Comprobante de pago', 'Payment receipt')}
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain rounded-lg shadow-lg max-h-[70vh]"
                  onError={(e) => {
                    console.error('Error loading image:', imageUrl, e);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', imageUrl);
                    setImageError(false);
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center" style={{ backgroundColor: colors.inputBackground }}>
                  <svg className="w-16 h-16 mb-4" style={{ color: colors.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-center mb-4" style={{ color: colors.muted }}>
                    {t('Error al cargar la imagen', 'Error loading image')}
                  </p>
                  <button
                    onClick={() => window.open(imageUrl, '_blank')}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ 
                      backgroundColor: colors.buttonBackground, 
                      color: colors.buttonText
                    }}
                  >
                    {t('Ver imagen original', 'View original image')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => window.open(imageUrl, '_blank')}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 text-sm sm:text-base order-2 sm:order-1"
            style={{ 
              backgroundColor: colors.buttonBackground, 
              color: colors.buttonText
            }}
          >
            {t('Abrir en ventana nueva', 'Open in new window')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 text-sm sm:text-base order-1 sm:order-2"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground
            }}
          >
            {t('Cerrar', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}