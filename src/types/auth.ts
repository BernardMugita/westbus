export interface User {
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  is_superuser: boolean;
  role: 'user' | 'admin';
  login_type: 'email_password' | 'google_oauth';
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  full_name: string;
  username: string;
  password: string;
  email: string;
  phone_number?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse {
  full_name: string;
  username: string;
  email: string;
  phone_number: string | null;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  payload?: UserResponse | string | null;
}
