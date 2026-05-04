export interface DriverAssignment {
  assignment_id: string;
  driver_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverAssignmentCreate {
  driver_id: string;
  vehicle_id: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
}

export interface DriverAssignmentUpdate {
  driver_id?: string;
  vehicle_id?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface DriverAssignmentResponse {
  status: 'success' | 'error';
  message: string;
  payload?: any;
}
