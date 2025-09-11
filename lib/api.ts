import { AuthResponse } from "./types";

// Use local proxy in development, direct URL in production
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// process.env.NODE_ENV === "development"
//   ? "" // Empty string uses current domain with proxy
//   : process.env.NEXT_PUBLIC_API_URL || "https://formacr.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gymName: string;
  gymAddress: string;
  gymPhone?: string;
  gymEmail?: string;
  monthlyFee: string;
  sinpePhone: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "unspecified";
  gymId: string;
  monthlyFee?: number;
  startDate?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    uid?: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "unspecified";
    profileImageUrl?: string;
    createdAt: string;
  };
  membership?: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    gracePeriodEnd?: string;
    monthlyFee: number;
  };
  message?: string;
  error?: string;
}

export interface GetMembershipsRequest {
  gymId: string;
  limit?: number;
  offset?: number;
  status?: string; // Optional status filter
}

export interface GetMembershipsResponse {
  success: boolean;
  memberships: Array<{
    id: string;
    user_id: string;
    gym_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    grace_period_end: string | null;
    monthly_fee: number;
    created_at: string;
    updated_at: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      date_of_birth: string | null;
      profile_image_url: string | null;
      gender?: string; // Optional for backward compatibility
      created_at: string;
    };
    latest_payment: {
      id: string;
      membership_id: string;
      amount: number;
      payment_method: string;
      sinpe_reference: string | null;
      sinpe_phone: string | null;
      payment_proof_url: string;
      status: string;
      payment_date: string;
      approved_date: string | null;
      notes: string | null;
    } | null;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  error?: string;
}

export interface GetPaymentsRequest {
  gymId: string;
  limit?: number;
  offset?: number;
  status?: string; // Optional status filter
  membershipId?: string; // Optional membership filter
}

export interface GetPaymentsResponse {
  success: boolean;
  payments: Array<{
    id: string;
    membership_id: string;
    amount: number;
    payment_method: string;
    sinpe_reference: string | null;
    sinpe_phone: string | null;
    payment_proof_url: string;
    status: string;
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
      gender?: string; // Optional for backward compatibility
    };
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  error?: string;
}

export interface UpdatePaymentRequest {
  paymentId: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejectionReason?: string;
  notes?: string;
  approvedBy?: string;
}

export interface UpdatePaymentResponse {
  success: boolean;
  payment: {
    id: string;
    membershipId: string;
    amount: number;
    paymentMethod: string;
    sinpeReference: string | null;
    sinpePhone: string | null;
    paymentProofUrl: string;
    status: string;
    paymentDate: string;
    approvedDate: string | null;
    approvedBy: string | null;
    rejectionReason: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  error?: string;
}

export interface UpdateUserRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "unspecified";
}

export interface UpdateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "unspecified";
    profileImageUrl?: string;
    updatedAt: string;
  };
  message?: string;
  error?: string;
}

export interface SendPaymentLinkRequest {
  membershipId: string;
}

export interface SendPaymentLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordRequest {
  access_token: string;
  refresh_token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const textResponse = await response.text();
    throw new ApiError(
      response.status,
      `Expected JSON but got: ${contentType}. Response: ${textResponse.substring(
        0,
        100
      )}`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred");
  }

  return data;
}

export const authApi = {
  signIn: (data: SignInRequest): Promise<AuthResponse> =>
    apiRequest("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signUp: (data: SignUpRequest): Promise<AuthResponse> =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signOut: (): Promise<{ success: boolean }> =>
    apiRequest("/api/auth/signout", {
      method: "POST",
    }),

  createUser: (data: CreateUserRequest): Promise<CreateUserResponse> =>
    apiRequest("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMemberships: (
    params: GetMembershipsRequest
  ): Promise<GetMembershipsResponse> => {
    const searchParams = new URLSearchParams({
      gymId: params.gymId,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.status && { status: params.status }),
    });

    return apiRequest(`/api/memberships?${searchParams.toString()}`, {
      method: "GET",
    });
  },

  getPayments: (params: GetPaymentsRequest): Promise<GetPaymentsResponse> => {
    const searchParams = new URLSearchParams({
      gymId: params.gymId,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.status && { status: params.status }),
      ...(params.membershipId && { membershipId: params.membershipId }),
    });

    return apiRequest(`/api/payments?${searchParams.toString()}`, {
      method: "GET",
    });
  },

  updatePayment: (data: UpdatePaymentRequest): Promise<UpdatePaymentResponse> =>
    apiRequest("/api/payments", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateUser: (data: UpdateUserRequest): Promise<UpdateUserResponse> =>
    apiRequest(`/api/users/${data.userId}`, {
      method: "PUT",
      body: JSON.stringify({
        email: data.email, // Incluir si quieres actualizar email
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      }),
    }),

  sendPaymentLink: (
    data: SendPaymentLinkRequest
  ): Promise<SendPaymentLinkResponse> =>
    apiRequest("/api/send-payment-link", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> =>
    apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordRequest): Promise<ResetPasswordResponse> =>
    apiRequest("/api/auth/reset-password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Test endpoint to debug proxy issues
  testUsersEndpoint: (): Promise<unknown> =>
    apiRequest("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
        gymId: "test-gym-id",
      }),
    }),
};

// Daily Workouts API
export interface GetWorkoutsRequest {
  gymId: string;
  year?: string;
  month?: string;
}

export interface GetWorkoutsResponse {
  success: boolean;
  workouts: Array<{
    id: string;
    gym_id: string;
    workout_date: string;
    workout_text: string;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}

export interface CreateWorkoutRequest {
  gym_id: string;
  workout_date: string;
  workout_text: string;
}

export interface CreateWorkoutResponse {
  success: boolean;
  workout: {
    id: string;
    gym_id: string;
    workout_date: string;
    workout_text: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export interface UpdateWorkoutRequest {
  id: string;
  workout_text: string;
}

export interface UpdateWorkoutResponse {
  success: boolean;
  workout: {
    id: string;
    gym_id: string;
    workout_date: string;
    workout_text: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export const workoutApi = {
  getWorkouts: (params: GetWorkoutsRequest): Promise<GetWorkoutsResponse> => {
    const searchParams = new URLSearchParams({
      gym_id: params.gymId,
      ...(params.year && { year: params.year }),
      ...(params.month && { month: params.month }),
    });

    return apiRequest(`/api/daily-workouts?${searchParams.toString()}`, {
      method: "GET",
    });
  },

  createWorkout: (data: CreateWorkoutRequest): Promise<CreateWorkoutResponse> =>
    apiRequest("/api/daily-workouts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWorkout: (data: UpdateWorkoutRequest): Promise<UpdateWorkoutResponse> =>
    apiRequest("/api/daily-workouts", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteWorkout: (id: string): Promise<{ success: boolean; message: string }> =>
    apiRequest(`/api/daily-workouts?id=${id}`, {
      method: "DELETE",
    }),
};

export { ApiError };
