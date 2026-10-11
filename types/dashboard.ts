export type DashboardMetric = {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
};

export type MonthlyGoal = {
  month: number;
  year: number;
  target: number;
  current: number;
};

export type DashboardSummary = {
  appointmentsToday: number;
  expectedRevenue: number;
  nextAppointmentTime?: string;
  nextClientName?: string;
  availableSlots: number;
};