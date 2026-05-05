export type MaintenanceScheduleStatus = 'Upcoming' | 'Overdue' | 'Done';

export interface MaintenanceScheduleRecord {
  schedule_id: string;
  vehicle_id: string;
  service_type: string;
  interval_km: number;
  interval_days: number;
  last_done_km: number | null;
  last_done_date: string | null;
  status: MaintenanceScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceScheduleCreate {
  vehicle_id: string;
  service_type: string;
  interval_km: number;
  interval_days: number;
  last_done_km?: number | null;
  last_done_date?: string | null;
  status?: MaintenanceScheduleStatus;
}

export interface MaintenanceScheduleUpdate {
  vehicle_id?: string;
  service_type?: string;
  interval_km?: number;
  interval_days?: number;
  last_done_km?: number | null;
  last_done_date?: string | null;
  status?: MaintenanceScheduleStatus;
}

export interface MaintenanceScheduleResponse {
  status: 'success' | 'error';
  message: string;
  payload?: MaintenanceScheduleRecord | MaintenanceScheduleRecord[] | any;
}
