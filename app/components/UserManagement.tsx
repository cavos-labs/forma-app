'use client'

import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { mockUsers, getStatusColor, getStatusLabel, type MockUser } from '@/lib/mock-data';

interface UserManagementProps {
  onCreateUser?: () => void;
}

export default function UserManagement({ onCreateUser }: UserManagementProps) {
  const { theme, colors } = useTheme();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MockUser['membership_status']>('all');
  const [users, setUsers] = useState(mockUsers);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.membership_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === 'es' ? 'Sin fecha' : 'No date';
    return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 lg:mb-10 space-y-6 lg:space-y-0">
        <div className="space-y-3">
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider" 
            style={{ 
              fontFamily: 'Romagothic, sans-serif',
              color: colors.foreground,
              letterSpacing: '0.15em'
            }}
          >
            {language === 'es' ? 'GESTIÓN DE USUARIOS' : 'USER MANAGEMENT'}
          </h1>
          <p className="text-base lg:text-lg" style={{ color: colors.muted }}>
            {language === 'es' 
              ? 'Administra los miembros de tu gimnasio'
              : 'Manage your gym members'
            }
          </p>
        </div>
        
        <button
          onClick={onCreateUser}
          className="w-full lg:w-auto px-6 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 group"
          style={{
            backgroundColor: colors.buttonBackground,
            color: colors.buttonText,
            fontFamily: 'Romagothic, sans-serif',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = theme === 'dark' 
              ? '0 10px 25px rgba(255, 255, 255, 0.1)'
              : '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonBackground;
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">{language === 'es' ? 'NUEVO USUARIO' : 'NEW USER'}</span>
            <span className="sm:hidden">+</span>
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-10">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar usuarios...' : 'Search users...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
              style={{
                backgroundColor: colors.inputBackground,
                color: colors.inputText,
                border: `1px solid ${colors.inputBorder}`,
                fontSize: '16px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.buttonBackground;
                e.currentTarget.style.boxShadow = theme === 'dark' 
                  ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
                  : '0 0 0 3px rgba(55, 55, 55, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.inputBorder;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent font-medium uppercase tracking-wide transition-all duration-200"
            style={{
              backgroundColor: colors.inputBackground,
              color: colors.inputText,
              border: `1px solid ${colors.inputBorder}`,
              fontFamily: 'Romagothic, sans-serif',
              fontSize: '12px sm:text-sm'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.buttonBackground;
              e.currentTarget.style.boxShadow = theme === 'dark' 
                ? '0 0 0 3px rgba(255, 255, 255, 0.1)'
                : '0 0 0 3px rgba(55, 55, 55, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.inputBorder;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">
              {language === 'es' ? 'TODOS LOS ESTADOS' : 'ALL STATUSES'}
            </option>
            <option value="active">
              {getStatusLabel('active', language).toUpperCase()}
            </option>
            <option value="expired">
              {getStatusLabel('expired', language).toUpperCase()}
            </option>
            <option value="pending_payment">
              {getStatusLabel('pending_payment', language).toUpperCase()}
            </option>
            <option value="inactive">
              {getStatusLabel('inactive', language).toUpperCase()}
            </option>
            <option value="cancelled">
              {getStatusLabel('cancelled', language).toUpperCase()}
            </option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {[
          { 
            label: language === 'es' ? 'TOTAL' : 'TOTAL', 
            value: users.length, 
            color: colors.foreground,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          { 
            label: language === 'es' ? 'ACTIVOS' : 'ACTIVE', 
            value: users.filter(u => u.membership_status === 'active').length,
            color: getStatusColor('active', theme),
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          { 
            label: language === 'es' ? 'VENCIDOS' : 'EXPIRED', 
            value: users.filter(u => u.membership_status === 'expired').length,
            color: getStatusColor('expired', theme),
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          { 
            label: language === 'es' ? 'PENDIENTES' : 'PENDING', 
            value: users.filter(u => u.membership_status === 'pending_payment').length,
            color: getStatusColor('pending_payment', theme),
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          }
        ].map((stat, index) => (
          <div 
            key={index}
            className="p-4 sm:p-6 rounded-2xl border transition-all duration-200 hover:transform hover:-translate-y-1 cursor-pointer group"
            style={{ 
              backgroundColor: colors.background,
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme === 'dark' 
                ? '0 20px 40px rgba(255, 255, 255, 0.1)'
                : '0 20px 40px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div 
                className="p-2 sm:p-3 rounded-xl transition-transform duration-200 group-hover:scale-110 mb-2 sm:mb-0"
                style={{ 
                  backgroundColor: stat.color + '20',
                  color: stat.color
                }}
              >
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ 
                color: stat.color,
                fontFamily: 'Romagothic, sans-serif'
              }}>
                {stat.value}
              </div>
            </div>
            <div 
              className="text-xs sm:text-sm font-bold uppercase tracking-widest" 
              style={{ 
                color: colors.muted,
                fontFamily: 'Romagothic, sans-serif',
                letterSpacing: '0.15em'
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Users - Desktop Table / Mobile Cards */}
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-2xl border overflow-hidden" style={{ 
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb',
        backgroundColor: colors.background
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'USUARIO' : 'USER'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'ESTADO' : 'STATUS'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'TELÉFONO' : 'PHONE'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'VENCIMIENTO' : 'EXPIRATION'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'MENSUALIDAD' : 'MONTHLY FEE'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-widest" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif',
                  letterSpacing: '0.15em'
                }}>
                  {language === 'es' ? 'ACCIONES' : 'ACTIONS'}
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: colors.background }}>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-t transition-all duration-200 hover:bg-opacity-50 group"
                  style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div 
                          className="h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{ 
                            backgroundColor: getStatusColor(user.membership_status, theme) + '20',
                            border: `2px solid ${getStatusColor(user.membership_status, theme)}30`
                          }}
                        >
                          <span className="text-base font-bold uppercase tracking-wide" style={{ 
                            color: getStatusColor(user.membership_status, theme),
                            fontFamily: 'Romagothic, sans-serif'
                          }}>
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-bold uppercase tracking-wide" style={{ 
                          color: colors.foreground,
                          fontFamily: 'Romagothic, sans-serif'
                        }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm mt-1" style={{ color: colors.muted }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex px-3 py-1 text-xs font-bold rounded-xl uppercase tracking-wider"
                      style={{ 
                        backgroundColor: getStatusColor(user.membership_status, theme) + '20',
                        color: getStatusColor(user.membership_status, theme),
                        fontFamily: 'Romagothic, sans-serif'
                      }}
                    >
                      {getStatusLabel(user.membership_status, language).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: colors.foreground }}>
                    {user.phone || (language === 'es' ? 'Sin teléfono' : 'No phone')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: colors.foreground }}>
                    {formatDate(user.membership_end_date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold uppercase tracking-wide" style={{ 
                    color: colors.foreground,
                    fontFamily: 'Romagothic, sans-serif'
                  }}>
                    {formatCurrency(user.monthly_fee)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200"
                        style={{ 
                          color: colors.foreground,
                          backgroundColor: 'transparent',
                          fontFamily: 'Romagothic, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {language === 'es' ? 'EDITAR' : 'EDIT'}
                      </button>
                      <button 
                        className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200"
                        style={{ 
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          fontFamily: 'Romagothic, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef444420';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {language === 'es' ? 'ELIMINAR' : 'DELETE'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user, index) => (
          <div 
            key={user.id}
            className="p-4 rounded-2xl border transition-all duration-200"
            style={{ 
              backgroundColor: colors.background,
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb'
            }}
          >
            <div className="flex items-start space-x-4 mb-4">
              <div 
                className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: getStatusColor(user.membership_status, theme) + '20',
                  border: `2px solid ${getStatusColor(user.membership_status, theme)}30`
                }}
              >
                <span className="text-base font-bold uppercase tracking-wide" style={{ 
                  color: getStatusColor(user.membership_status, theme),
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {user.first_name[0]}{user.last_name[0]}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold uppercase tracking-wide" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm mt-1" style={{ color: colors.muted }}>
                  {user.email}
                </div>
              </div>
              <span 
                className="inline-flex px-3 py-1 text-xs font-bold rounded-xl uppercase tracking-wider flex-shrink-0"
                style={{ 
                  backgroundColor: getStatusColor(user.membership_status, theme) + '20',
                  color: getStatusColor(user.membership_status, theme),
                  fontFamily: 'Romagothic, sans-serif'
                }}
              >
                {getStatusLabel(user.membership_status, language).toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold" style={{ 
                  color: colors.muted,
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {language === 'es' ? 'TELÉFONO' : 'PHONE'}
                </span>
                <div className="mt-1" style={{ color: colors.foreground }}>
                  {user.phone || (language === 'es' ? 'Sin teléfono' : 'No phone')}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold" style={{ 
                  color: colors.muted,
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {language === 'es' ? 'VENCIMIENTO' : 'EXPIRATION'}
                </span>
                <div className="mt-1" style={{ color: colors.foreground }}>
                  {formatDate(user.membership_end_date)}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs uppercase tracking-wider font-bold" style={{ 
                  color: colors.muted,
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {language === 'es' ? 'MENSUALIDAD' : 'MONTHLY FEE'}
                </span>
                <div className="mt-1 text-base font-bold uppercase tracking-wide" style={{ 
                  color: colors.foreground,
                  fontFamily: 'Romagothic, sans-serif'
                }}>
                  {formatCurrency(user.monthly_fee)}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e7eb' }}>
              <button 
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200"
                style={{ 
                  color: colors.foreground,
                  backgroundColor: 'transparent',
                  border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                  fontFamily: 'Romagothic, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {language === 'es' ? 'EDITAR' : 'EDIT'}
              </button>
              <button 
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200"
                style={{ 
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  fontFamily: 'Romagothic, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef444420';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {language === 'es' ? 'ELIMINAR' : 'DELETE'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8" style={{ color: colors.muted }}>
          {language === 'es' ? 'No se encontraron usuarios' : 'No users found'}
        </div>
      )}
    </div>
  );
}