export type FinancialEntryCategory =
  | "service"
  | "product"
  | "other";

export type FinancialExpenseCategory =
  | "products"
  | "chair_rent"
  | "other";

export type FinancialEntry = {
  id: string;
  description: string;
  amount: number;
  category: FinancialEntryCategory;
  date: string;
  appointmentId?: string;
};

export type FinancialExpense = {
  id: string;
  description: string;
  amount: number;
  category: FinancialExpenseCategory;
  date: string;
};