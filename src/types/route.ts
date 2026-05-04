export interface Route {
  route_id: string;
  route_name: string;
  stop_order: string | null;
  distance_km: number | null;
  estimated_duration_min: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteCreate {
  route_name: string;
  stop_order?: string;
  distance_km?: number;
  estimated_duration_min?: number;
  is_active?: boolean;
}

export interface RouteUpdate {
  route_name?: string;
  stop_order?: string;
  distance_km?: number;
  estimated_duration_min?: number;
  is_active?: boolean;
}

export interface RouteResponse {
  status: 'success' | 'error';
  message: string;
  payload?: Route | Route[] | any;
}
