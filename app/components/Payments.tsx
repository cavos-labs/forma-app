'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { authApi, ApiError } from '@/lib/api';
import ReceiptModal from './ReceiptModal';

// Payment data interface based on API response
interface PaymentData {
  id: string;
  membership_id: string;
  amount: number;
  payment_method: string;
  sinpe_reference: string | null;
  sinpe_phone: string | null;
  payment_proof_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  payment_date: string;
  approved_date: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  membership: {
    id: string;
    user_id: string;
    gym_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    monthly_fee: number;
  };
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    date_of_birth: string | null;
    profile_image_url: string | null;
  };
}

type PaymentStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export default function Payments() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { gym, user } = useAuth();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    imageUrl: string;
    paymentInfo: {
      amount: number;
      date: string;
      reference?: string;
      phone?: string;
    };
  } | null>(null);

  // Translation function
  const t = useCallback((es: string, en: string) => language === 'es' ? es : en, [language]);

  // Load payments from API
  const loadPayments = useCallback(async () => {
    if (!gym?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.getPayments({
        gymId: gym.id,
        limit: 100, // Get more records for now
        offset: 0,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      if (response.success && response.payments) {
        setPayments(response.payments as PaymentData[]);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      let errorMessage = t('Error al cargar los pagos', 'Error loading payments');
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [gym?.id, statusFilter, t]);

  // Update payment status
  const updatePaymentStatus = async (paymentId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      setIsLoading(true);
      
      const response = await authApi.updatePayment({
        paymentId,
        status,
        rejectionReason,
        approvedBy: user?.id, // Use the logged-in user as the approver
      });

      if (response.success) {
        // Refresh payments list
        await loadPayments();
        setIsModalOpen(false);
        setSelectedPayment(null);
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      let errorMessage = t('Error al actualizar el pago', 'Error updating payment');
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payments when component mounts or gym changes
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Reload when status filter changes
  useEffect(() => {
    if (gym?.id) {
      loadPayments();
    }
  }, [gym?.id, loadPayments, statusFilter]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'approved':
        return t('Aprobado', 'Approved');
      case 'pending':
        return t('Pendiente', 'Pending');
      case 'rejected':
        return t('Rechazado', 'Rejected');
      case 'cancelled':
        return t('Cancelado', 'Cancelled');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const locale = language === 'es' ? 'es-CR' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    const locale = language === 'es' ? 'es-CR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      `${payment.user.first_name} ${payment.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.sinpe_reference && payment.sinpe_reference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    cancelled: payments.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className="p-3 sm:p-6">
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
      {/* Header - Mobile simplified */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
          {t('Pagos', 'Payments')}
        </h1>
        <button
          onClick={loadPayments}
          disabled={isLoading}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{ 
            backgroundColor: colors.buttonBackground,
            color: colors.buttonText,
            border: 'none'
          }}
          title={t('Actualizar pagos', 'Refresh payments')}
        >
          <svg 
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>

      {/* Status Filter Tabs - Horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 mb-4 pb-2 -mx-3 px-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as PaymentStatus)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95 ${
              statusFilter === status ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: statusFilter === status ? colors.buttonBackground : colors.card,
              color: statusFilter === status ? colors.buttonText : colors.foreground,
              borderColor: statusFilter === status ? colors.buttonBackground : colors.border,
              '--tw-ring-color': statusFilter === status ? colors.buttonBackground : 'transparent',
            } as React.CSSProperties}
          >
            {status === 'all' ? t('Todos', 'All') : 
             status === 'pending' ? t('Pendientes', 'Pending') :
             status === 'approved' ? t('Aprobados', 'Approved') :
             status === 'rejected' ? t('Rechazados', 'Rejected') : t('Cancelados', 'Cancelled')} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder={t('Buscar...', 'Search...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
            color: colors.inputText,
            '--tw-ring-color': colors.buttonBackground,
          } as React.CSSProperties}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="mb-6 p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: '#EF444420',
            borderColor: '#EF4444',
            color: '#DC2626'
          }}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colors.primary }}></div>
            <span style={{ color: colors.foreground }}>{t('Cargando pagos...', 'Loading payments...')}</span>
          </div>
        </div>
      )}

      {/* Payments Grid - Mobile optimized */}
      {!isLoading && (
        <div className="space-y-4 sm:space-y-6">
        {filteredPayments.map((payment, index) => (
          <div
            key={payment.id}
            className="rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 animate-fade-in-up"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Mobile-first simplified layout */}
            <div className="space-y-3">
              {/* Main Info Row */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base" style={{ color: colors.foreground }}>
                      {payment.user.first_name} {payment.user.last_name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: colors.foreground, opacity: 0.7 }}>
                    {payment.user.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg" style={{ color: colors.foreground }}>
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-xs" style={{ color: colors.foreground, opacity: 0.6 }}>
                    {formatDate(payment.payment_date)}
                  </div>
                </div>
              </div>

              {/* SINPE Info (only if exists) */}
              {(payment.sinpe_reference || payment.sinpe_phone) && (
                <div className="flex gap-4 text-xs" style={{ color: colors.foreground, opacity: 0.8 }}>
                  {payment.sinpe_reference && (
                    <span>Ref: {payment.sinpe_reference}</span>
                  )}
                  {payment.sinpe_phone && (
                    <span>Tel: {payment.sinpe_phone}</span>
                  )}
                </div>
              )}

              {/* Action Row */}
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: colors.border }}>
                <div className="flex gap-2">
                  {payment.payment_proof_url && !payment.payment_proof_url.includes('pending-upload') ? (
                    <button
                      onClick={() => {
                        setSelectedReceipt({
                          imageUrl: payment.payment_proof_url,
                          paymentInfo: {
                            amount: payment.amount,
                            date: payment.payment_date,
                            reference: payment.sinpe_reference || undefined,
                            phone: payment.sinpe_phone || undefined,
                          }
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                      style={{ backgroundColor: '#0066ff', color: 'white', border: 'none', boxShadow: 'none' }}
                    >
                      {t('Ver comprobante', 'View Receipt')}
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1" style={{ color: colors.foreground, opacity: 0.5 }}>
                      {t('Sin comprobante', 'No receipt')}
                    </span>
                  )}
                </div>

                {payment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePaymentStatus(payment.id, 'approved')}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                      style={{ backgroundColor: '#00CC44', color: 'white', border: 'none', boxShadow: 'none' }}
                    >
                      {t('Aprobar', 'Approve')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                      style={{ backgroundColor: '#FF3333', color: 'white', border: 'none', boxShadow: 'none' }}
                    >
                      {t('Rechazar', 'Reject')}
                    </button>
                  </div>
                )}
              </div>

              {/* Rejection reason if exists */}
              {payment.rejection_reason && (
                <div className="text-xs p-2 rounded-md" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <strong>{t('Rechazado:', 'Rejected:')} </strong>{payment.rejection_reason}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && !error && (
          <div className="text-center py-12">
            <p style={{ color: colors.foreground, opacity: 0.6 }}>
              {t('No se encontraron pagos con los filtros aplicados.', 'No payments found with the applied filters.')}
            </p>
          </div>
        )}
        </div>
      )}

      {/* Rejection Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div 
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
            style={{ backgroundColor: colors.card, color: colors.foreground }}
          >
            <h3 className="text-lg font-semibold mb-4">
              {t('Rechazar Pago', 'Reject Payment')}
            </h3>
            <p className="mb-4" style={{ opacity: 0.8 }}>
              {t('¿Estás seguro de que deseas rechazar este pago?', 'Are you sure you want to reject this payment?')}
            </p>
            <textarea
              placeholder={t('Razón del rechazo (opcional)', 'Rejection reason (optional)')}
              className="w-full p-2 border rounded mb-4 resize-none"
              rows={3}
              style={{
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.inputText
              }}
              onChange={(e) => {
                if (selectedPayment) {
                  setSelectedPayment({
                    ...selectedPayment,
                    rejection_reason: e.target.value
                  });
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 rounded text-sm"
                style={{ backgroundColor: colors.border, color: colors.foreground }}
              >
                {t('Cancelar', 'Cancel')}
              </button>
              <button
                onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected', selectedPayment.rejection_reason || undefined)}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ backgroundColor: '#DC2626' }}
              >
                {t('Rechazar', 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          imageUrl={selectedReceipt.imageUrl}
          paymentInfo={selectedReceipt.paymentInfo}
        />
      )}
    </div>
  );
}