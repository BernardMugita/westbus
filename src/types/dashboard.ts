export interface ComplianceAlert {
  vehicle_id: string;
  registration_number: string;
  expiry_date: string;
  type: 'License' | 'Insurance';
}

export interface ActiveClaim {
  claim_id: string;
  vehicle_id: string;
  registration_number: string;
  status: string;
  amount_claimed: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  expense: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface LoanHealth {
  total_outstanding: number;
  next_repayment_date: string | null;
  next_repayment_amount: number | null;
}

export interface MaintenanceInsight {
  vehicle_id: string;
  registration_number: string;
  service_type: string;
  due_in_km: number | null;
  due_in_days: number | null;
}

export interface VehicleMaintenanceCost {
  vehicle_id: string;
  registration_number: string;
  total_cost: number;
}

export interface RecentTrip {
  trip_id: string;
  route: string;
  driver: string;
  vehicle: string;
  status: string;
  start_time: string;
  distance_km: number | null;
}

export interface RecentRevenue {
  revenue_id: string;
  trip_id: string;
  amount: number;
  source: string;
  recorded_at: string;
}

export interface RouteProfitability {
  route_name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface OperationalKPIs {
  fuel_efficiency: number;
  fleet_availability: number;
}

export interface FleetStatus {
  total: number;
  active: number;
  maintenance: number;
  expired_docs: number;
}

export interface DashboardData {
  fleet_status: FleetStatus;
  compliance_alerts: ComplianceAlert[];
  active_claims: ActiveClaim[];
  financial_summary: FinancialSummary;
  revenue_vs_expense: ChartDataPoint[];
  expense_breakdown: ExpenseCategory[];
  loan_health: LoanHealth;
  maintenance_insights: MaintenanceInsight[];
  top_maintenance_costs: VehicleMaintenanceCost[];
  operational_kpis: OperationalKPIs;
  recent_trips: RecentTrip[];
  recent_revenue: RecentRevenue[];
  route_profitability: RouteProfitability[];
}

export interface DashboardResponse {
  status: string;
  message: string;
  payload?: DashboardData;
}
