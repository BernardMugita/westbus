export type TripStatus = 'Completed' | 'Cancelled' | 'Ongoing';

export interface Trip {
  trip_id: string;
  vehicle_id: string;
  driver_id: string;
  route_id: string;
  start_time: string;
  end_time: string | null;
  expected_duration_min: number | null;
  distance_km: number | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface TripCreate {
  vehicle_id: string;
  driver_id: string;
  route_id: string;
  start_time: string;
  end_time?: string;
  expected_duration_min?: number;
  distance_km?: number;
  status?: TripStatus;
}

export interface TripUpdate {
  vehicle_id?: string;
  driver_id?: string;
  route_id?: string;
  start_time?: string;
  end_time?: string;
  expected_duration_min?: number;
  distance_km?: number;
  status?: TripStatus;
}

export interface TripResponse {
  status: 'success' | 'error';
  message: string;
  payload?: Trip | Trip[] | any;
}
