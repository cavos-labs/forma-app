// Shared types for forma-app
export interface User {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
}

export interface Gym {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  monthly_fee: number;
  sinpe_phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  gym?: Gym;
  userId?: string;
  gymId?: string;
  message?: string;
  error?: string;
}

// Gender enum based on database schema
export type Gender = "male" | "female" | "unspecified";

// Membership and payment types based on database schema
export type MembershipStatus =
  | "pending_payment"
  | "active"
  | "expired"
  | "inactive"
  | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface MembershipData {
  id: string;
  user_id: string;
  gym_id: string;
  status: MembershipStatus;
  start_date: string | null;
  end_date: string | null;
  grace_period_end: string | null;
  monthly_fee: number;
  created_at: string;
  // User data
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    profile_image_url: string | null;
    gender: Gender;
  };
  // Latest payment data
  latest_payment: {
    id: string;
    amount: number;
    status: PaymentStatus;
    payment_date: string;
    sinpe_reference: string | null;
    sinpe_phone: string | null;
    payment_proof_url: string;
  } | null;
}
