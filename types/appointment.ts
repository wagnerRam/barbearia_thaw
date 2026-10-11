import type { Service } from "./service";
import type { Professional } from "./professional";
import type { Client } from "./client";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: string;
  client: Client;
  service: Service;
  professional: Professional;
  date: string;
  time: string;
  observations?: string;
  status: AppointmentStatus;
  createdAt: string;
};