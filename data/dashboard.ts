
import type {
  DashboardSummary,
  MonthlyGoal,
} from "@/types/dashboard";

export const dashboardSummary: DashboardSummary = {
  appointmentsToday: 0,
  expectedRevenue: 0,
  nextAppointmentTime: undefined,
  nextClientName: undefined,
  availableSlots: 0,
};

export const monthlyGoal: MonthlyGoal = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  target: 0,
  current: 0,
};
