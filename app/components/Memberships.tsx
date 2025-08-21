'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { MembershipData, MembershipStatus, PaymentStatus } from '@/lib/types';
import { authApi, ApiError } from '@/lib/api';
import ReceiptModal from './ReceiptModal';

// Mock data matching the database structure
const mockMemberships: MembershipData[] = [
  {
    id: '1',
    user_id: 'user-1',
    gym_id: 'gym-1',
    status: 'active',
    start_date: '2024-07-01',
    end_date: '2024-08-01',
    grace_period_end: '2024-08-04',
    monthly_fee: 25000,
    created_at: '2024-07-01T10:00:00Z',
    user: {
      first_name: 'María',
      last_name: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+506 8888-8888',
      date_of_birth: '1990-03-15',
      profile_image_url: null,
    },
    latest_payment: {
      id: 'payment-1',
      amount: 25000,
      status: 'approved',
      payment_date: '2024-07-01T09:00:00Z',
      sinpe_reference: 'REF123456',
      sinpe_phone: '+506 8888-8888',
      payment_proof_url: '/payment-proof-1.jpg'
    }
  },
  {
    id: '2',
    user_id: 'user-2',
    gym_id: 'gym-1',
    status: 'pending_payment',
    start_date: null,
    end_date: null,
    grace_period_end: null,
    monthly_fee: 25000,
    created_at: '2024-07-15T14:30:00Z',
    user: {
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+506 7777-7777',
      date_of_birth: '1985-11-22',
      profile_image_url: null,
    },
    latest_payment: {
      id: 'payment-2',
      amount: 25000,
      status: 'pending',
      payment_date: '2024-07-15T14:00:00Z',
      sinpe_reference: 'REF789012',
      sinpe_phone: '+506 7777-7777',
      payment_proof_url: '/payment-proof-2.jpg'
    }
  },
  {
    id: '3',
    user_id: 'user-3',
    gym_id: 'gym-1',
    status: 'expired',
    start_date: '2024-06-01',
    end_date: '2024-07-10',
    grace_period_end: '2024-07-13',
    monthly_fee: 25000,
    created_at: '2024-06-01T08:00:00Z',
    user: {
      first_name: 'Ana',
      last_name: 'Martínez',
      email: 'ana.martinez@email.com',
      phone: '+506 6666-6666',
      date_of_birth: '1992-08-07',
      profile_image_url: null,
    },
    latest_payment: {
      id: 'payment-3',
      amount: 25000,
      status: 'approved',
      payment_date: '2024-06-01T07:30:00Z',
      sinpe_reference: 'REF345678',
      sinpe_phone: '+506 6666-6666',
      payment_proof_url: '/payment-proof-3.jpg'
    }
  },
  {
    id: '4',
    user_id: 'user-4',
    gym_id: 'gym-1',
    status: 'active',
    start_date: '2024-07-10',
    end_date: '2024-08-10',
    grace_period_end: '2024-08-13',
    monthly_fee: 25000,
    created_at: '2024-07-10T16:00:00Z',
    user: {
      first_name: 'Luis',
      last_name: 'Vargas',
      email: 'luis.vargas@email.com',
      phone: null,
      date_of_birth: '1988-12-03',
      profile_image_url: null,
    },
    latest_payment: {
      id: 'payment-4',
      amount: 25000,
      status: 'approved',
      payment_date: '2024-07-10T15:30:00Z',
      sinpe_reference: 'REF901234',
      sinpe_phone: '+506 5555-5555',
      payment_proof_url: '/payment-proof-4.jpg'
    }
  },
];

interface MembershipsProps {
  onCreateUser: () => void;
}

export interface MembershipsRef {
  refresh: () => void;
}

const Memberships = forwardRef<MembershipsRef, MembershipsProps>(({ onCreateUser }, ref) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { gym } = useAuth();
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const t = (es: string, en: string) => language === 'es' ? es : en;

  // Load memberships from API
  const loadMemberships = async () => {
    if (!gym?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.getMemberships({
        gymId: gym.id,
        limit: 100, // Get more records for now
        offset: 0,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      if (response.success && response.memberships) {
        // Transform API data to match our MembershipData interface
        const transformedMemberships: MembershipData[] = response.memberships.map(membership => ({
          id: membership.id,
          user_id: membership.user_id,
          gym_id: membership.gym_id,
          status: membership.status as MembershipStatus,
          start_date: membership.start_date,
          end_date: membership.end_date,
          grace_period_end: membership.grace_period_end,
          monthly_fee: membership.monthly_fee,
          created_at: membership.created_at,
          user: {
            first_name: membership.user.first_name,
            last_name: membership.user.last_name,
            email: membership.user.email,
            phone: membership.user.phone,
            date_of_birth: membership.user.date_of_birth,
            profile_image_url: membership.user.profile_image_url,
          },
          latest_payment: membership.latest_payment ? {
            id: membership.latest_payment.id,
            amount: membership.latest_payment.amount,
            status: membership.latest_payment.status as PaymentStatus,
            payment_date: membership.latest_payment.payment_date,
            sinpe_reference: membership.latest_payment.sinpe_reference,
            sinpe_phone: membership.latest_payment.sinpe_phone,
            payment_proof_url: membership.latest_payment.payment_proof_url,
          } : null
        }));

        setMemberships(transformedMemberships);
      }
    } catch (err) {
      console.error('Error loading memberships:', err);
      let errorMessage = t('Error al cargar las membresías', 'Error loading memberships');
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // Fallback to mock data on error for development
      setMemberships(mockMemberships);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: loadMemberships
  }), [loadMemberships]);

  // Load memberships when component mounts or gym changes
  useEffect(() => {
    loadMemberships();
  }, [gym?.id]);

  // Reload when status filter changes
  useEffect(() => {
    if (gym?.id) {
      loadMemberships();
    }
  }, [statusFilter]);

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'pending_payment':
        return '#F59E0B';
      case 'expired':
        return '#EF4444';
      case 'inactive':
        return '#6B7280';
      case 'cancelled':
        return '#DC2626';
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return t('Activa', 'Active');
      case 'pending_payment':
        return t('Pendiente Pago', 'Pending Payment');
      case 'expired':
        return t('Vencida', 'Expired');
      case 'inactive':
        return t('Inactiva', 'Inactive');
      case 'cancelled':
        return t('Cancelada', 'Cancelled');
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
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

  const getPaymentStatusText = (status: PaymentStatus) => {
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
    return new Date(dateString).toLocaleDateString(locale);
  };

  const formatCurrency = (amount: number) => {
    const locale = language === 'es' ? 'es-CR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesStatus = statusFilter === 'all' || membership.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      `${membership.user.first_name} ${membership.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: memberships.length,
    active: memberships.filter(m => m.status === 'active').length,
    pending_payment: memberships.filter(m => m.status === 'pending_payment').length,
    expired: memberships.filter(m => m.status === 'expired').length,
    inactive: memberships.filter(m => m.status === 'inactive').length,
    cancelled: memberships.filter(m => m.status === 'cancelled').length,
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: colors.foreground }}>
              {t('Membresías', 'Memberships')}
            </h1>
            <p className="text-sm sm:text-base" style={{ color: colors.foreground, opacity: 0.7 }}>
              {t('Gestiona todas las membresías', 'Manage all memberships')}
            </p>
          </div>
          <button
            onClick={onCreateUser}
            className="px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
            style={{ 
              backgroundColor: colors.buttonBackground, 
              color: colors.buttonText
            }}
          >
            {t('Nueva Membresía', 'New Membership')}
          </button>
        </div>
      </div>

      {/* Status Filter Tabs - Horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 mb-4 pb-2 -mx-3 px-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as MembershipStatus | 'all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === status ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: statusFilter === status ? colors.buttonBackground : colors.card,
              color: statusFilter === status ? colors.buttonText : colors.foreground,
              borderColor: statusFilter === status ? colors.buttonBackground : colors.border,
              '--tw-ring-color': statusFilter === status ? colors.buttonBackground : 'transparent',
            } as React.CSSProperties}
          >
            {status === 'all' ? t('Todas', 'All') : 
             status === 'active' ? t('Activas', 'Active') :
             status === 'pending_payment' ? t('Pendiente Pago', 'Pending Payment') :
             status === 'expired' ? t('Vencidas', 'Expired') :
             status === 'inactive' ? t('Inactivas', 'Inactive') : t('Canceladas', 'Cancelled')} ({count})
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
            <span style={{ color: colors.foreground }}>{t('Cargando membresías...', 'Loading memberships...')}</span>
          </div>
        </div>
      )}

      {/* Memberships Grid - Mobile optimized */}
      {!isLoading && (
        <div className="space-y-4 sm:space-y-6">
        {filteredMemberships.map((membership) => (
          <div
            key={membership.id}
            className="rounded-lg border p-4 transition-colors hover:shadow-md"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            {/* Mobile-first simplified layout */}
            <div className="space-y-3">
              {/* Main Info Row */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base" style={{ color: colors.foreground }}>
                      {membership.user.first_name} {membership.user.last_name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getStatusColor(membership.status) }}
                    >
                      {getStatusText(membership.status)}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: colors.foreground, opacity: 0.7 }}>
                    {membership.user.email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg" style={{ color: colors.foreground }}>
                    {formatCurrency(membership.monthly_fee)}
                  </div>
                  <div className="text-xs" style={{ color: colors.foreground, opacity: 0.6 }}>
                    {membership.end_date ? t('Vence', 'Expires') + ': ' + formatDate(membership.end_date) : t('Sin fecha', 'No date')}
                  </div>
                </div>
              </div>

              {/* Latest Payment Status */}
              {membership.latest_payment && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: colors.foreground, opacity: 0.7 }}>
                      {t('Último pago:', 'Latest payment:')}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getPaymentStatusColor(membership.latest_payment.status) }}
                    >
                      {getPaymentStatusText(membership.latest_payment.status)}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: colors.foreground, opacity: 0.6 }}>
                    {formatDate(membership.latest_payment.payment_date)}
                  </div>
                </div>
              )}

              {/* Action Row */}
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: colors.border }}>
                <div className="flex gap-2">
                  {membership.latest_payment?.payment_proof_url ? (
                    <button
                      onClick={() => {
                        setSelectedReceipt({
                          imageUrl: membership.latest_payment!.payment_proof_url,
                          paymentInfo: {
                            amount: membership.latest_payment!.amount,
                            date: membership.latest_payment!.payment_date,
                            reference: membership.latest_payment!.sinpe_reference || undefined,
                            phone: membership.latest_payment!.sinpe_phone || undefined,
                          }
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="text-xs px-3 py-1.5 rounded-md font-bold"
                      style={{ backgroundColor: '#2563EB', color: 'white', border: 'none' }}
                    >
                      {t('Ver comprobante', 'View Receipt')}
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1" style={{ color: colors.foreground, opacity: 0.5 }}>
                      {t('Sin pagos', 'No payments')}
                    </span>
                  )}
                </div>

                {membership.latest_payment?.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-1.5 rounded-md text-xs font-bold transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#15803D', color: 'white', border: 'none' }}
                    >
                      {t('Aprobar', 'Approve')}
                    </button>
                    <button
                      className="px-4 py-1.5 rounded-md text-xs font-bold transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#DC2626', color: 'white', border: 'none' }}
                    >
                      {t('Rechazar', 'Reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredMemberships.length === 0 && !error && (
          <div className="text-center py-12">
            <p style={{ color: colors.foreground, opacity: 0.6 }}>
              {t('No se encontraron membresías con los filtros aplicados.', 'No memberships found with the applied filters.')}
            </p>
          </div>
        )}
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
});

Memberships.displayName = 'Memberships';

export default Memberships;