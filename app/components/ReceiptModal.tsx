'use client'

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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div 
        className="bg-white rounded-lg max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden flex flex-col"
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
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
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
            <img 
              src={imageUrl}
              alt={t('Comprobante de pago', 'Payment receipt')}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              style={{ maxHeight: 'calc(70vh - 120px)' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-gray-500">
                    <svg class="w-12 h-12 sm:w-16 sm:h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm sm:text-base text-center">${t('No se pudo cargar la imagen', 'Could not load image')}</p>
                  </div>
                `;
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => window.open(imageUrl, '_blank')}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base order-2 sm:order-1"
            style={{ 
              backgroundColor: colors.buttonBackground, 
              color: colors.buttonText
            }}
          >
            {t('Abrir en ventana nueva', 'Open in new window')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border transition-colors text-sm sm:text-base order-1 sm:order-2"
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