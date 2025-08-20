// Use local proxy in development, direct URL in production
const API_URL = process.env.NODE_ENV === 'development' 
  ? '' // Empty string uses current domain with proxy
  : process.env.NEXT_PUBLIC_API_URL || 'https://formacr.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

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

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    metadata: any;
  };
  gym?: {
    id: string;
    name: string;
    is_active: boolean;
    role: string;
  };
  userId?: string;
  gymId?: string;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

export const authApi = {
  signIn: (data: SignInRequest): Promise<AuthResponse> =>
    apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signUp: (data: SignUpRequest): Promise<AuthResponse> =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signOut: (): Promise<{ success: boolean }> =>
    apiRequest('/api/auth/signout', {
      method: 'POST',
    }),
};

export { ApiError };