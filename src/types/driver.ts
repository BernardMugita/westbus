export type DriverStatus = 'Active' | 'Suspended' | 'Left';

export interface Driver {
  driver_id: string;
  name: string;
  license_number: string;
  phone: string | null;
  hire_date: string | null;
  status: DriverStatus;
  created_at: string;
  updated_at: string;
}

export interface DriverCreate {
  name: string;
  license_number: string;
  phone?: string;
  hire_date?: string; // ISO string
  status?: string;
}

export interface DriverUpdate {
  name?: string;
  license_number?: string;
  phone?: string;
  hire_date?: string;
  status?: string;
}

export interface DriverResponse {
  status: 'success' | 'error';
  message: string;
  payload?: any;
}
