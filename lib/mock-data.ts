export interface MockUser {
  id: string;
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  profile_image_url: string | null;
  created_at: string;
  membership_status: 'active' | 'expired' | 'inactive' | 'pending_payment' | 'cancelled';
  membership_end_date: string | null;
  monthly_fee: number;
}

export interface MockGym {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  monthly_fee: number;
  sinpe_phone: string;
  is_active: boolean;
  created_at: string;
}

export const mockGym: MockGym = {
  id: "gym-001",
  name: "PowerGym San José",
  description: "Gimnasio completo con equipos modernos y entrenadores certificados",
  address: "San José Centro, Avenida Central, Costa Rica",
  phone: "+506 2222-3333",
  email: "info@powergym.cr",
  logo_url: null,
  monthly_fee: 25000.00,
  sinpe_phone: "+506 8888-7777",
  is_active: true,
  created_at: "2024-01-15T10:30:00Z"
};

export const mockUsers: MockUser[] = [
  {
    id: "user-001",
    uid: "auth_uid_001",
    email: "maria.gonzalez@email.com",
    first_name: "María",
    last_name: "González",
    phone: "+506 8888-1234",
    date_of_birth: "1990-05-15",
    profile_image_url: null,
    created_at: "2024-01-20T09:15:00Z",
    membership_status: "active",
    membership_end_date: "2024-09-20",
    monthly_fee: 25000.00
  },
  {
    id: "user-002",
    uid: "auth_uid_002",
    email: "carlos.rodriguez@email.com",
    first_name: "Carlos",
    last_name: "Rodríguez",
    phone: "+506 8888-5678",
    date_of_birth: "1988-12-03",
    profile_image_url: null,
    created_at: "2024-02-01T14:30:00Z",
    membership_status: "active",
    membership_end_date: "2024-10-01",
    monthly_fee: 25000.00
  },
  {
    id: "user-003",
    uid: "auth_uid_003",
    email: "ana.martinez@email.com",
    first_name: "Ana",
    last_name: "Martínez",
    phone: "+506 8888-9012",
    date_of_birth: "1992-08-22",
    profile_image_url: null,
    created_at: "2024-01-10T11:45:00Z",
    membership_status: "expired",
    membership_end_date: "2024-07-10",
    monthly_fee: 25000.00
  },
  {
    id: "user-004",
    uid: "auth_uid_004",
    email: "luis.hernandez@email.com",
    first_name: "Luis",
    last_name: "Hernández",
    phone: "+506 8888-3456",
    date_of_birth: "1985-03-10",
    profile_image_url: null,
    created_at: "2024-03-05T16:20:00Z",
    membership_status: "active",
    membership_end_date: "2024-11-05",
    monthly_fee: 25000.00
  },
  {
    id: "user-005",
    uid: "auth_uid_005",
    email: "sofia.vargas@email.com",
    first_name: "Sofía",
    last_name: "Vargas",
    phone: "+506 8888-7890",
    date_of_birth: "1995-11-18",
    profile_image_url: null,
    created_at: "2024-02-20T08:10:00Z",
    membership_status: "pending_payment",
    membership_end_date: null,
    monthly_fee: 25000.00
  },
  {
    id: "user-006",
    uid: "auth_uid_006",
    email: "diego.morales@email.com",
    first_name: "Diego",
    last_name: "Morales",
    phone: "+506 8888-2468",
    date_of_birth: "1987-07-25",
    profile_image_url: null,
    created_at: "2024-01-30T13:55:00Z",
    membership_status: "inactive",
    membership_end_date: "2024-05-30",
    monthly_fee: 25000.00
  },
  {
    id: "user-007",
    uid: "auth_uid_007",
    email: "patricia.jimenez@email.com",
    first_name: "Patricia",
    last_name: "Jiménez",
    phone: "+506 8888-1357",
    date_of_birth: "1993-04-14",
    profile_image_url: null,
    created_at: "2024-03-15T07:25:00Z",
    membership_status: "active",
    membership_end_date: "2024-11-15",
    monthly_fee: 25000.00
  },
  {
    id: "user-008",
    uid: "auth_uid_008",
    email: "jose.castro@email.com",
    first_name: "José",
    last_name: "Castro",
    phone: "+506 8888-9753",
    date_of_birth: "1989-09-07",
    profile_image_url: null,
    created_at: "2024-02-10T12:40:00Z",
    membership_status: "active",
    membership_end_date: "2024-10-10",
    monthly_fee: 25000.00
  }
];

export const getStatusColor = (status: MockUser['membership_status'], theme: 'light' | 'dark') => {
  const colors = {
    active: theme === 'dark' ? '#10b981' : '#059669',
    expired: theme === 'dark' ? '#f59e0b' : '#d97706', 
    inactive: theme === 'dark' ? '#ef4444' : '#dc2626',
    pending_payment: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    cancelled: theme === 'dark' ? '#6b7280' : '#4b5563'
  };
  return colors[status];
};

export const getStatusLabel = (status: MockUser['membership_status'], language: 'en' | 'es') => {
  const labels = {
    en: {
      active: 'Active',
      expired: 'Expired',
      inactive: 'Inactive', 
      pending_payment: 'Pending Payment',
      cancelled: 'Cancelled'
    },
    es: {
      active: 'Activa',
      expired: 'Vencida',
      inactive: 'Inactiva',
      pending_payment: 'Pago Pendiente', 
      cancelled: 'Cancelada'
    }
  };
  return labels[language][status];
};