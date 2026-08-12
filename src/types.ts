export interface Appointment {
  id: string;
  name: string;
  contactNumber: string;
  organization: string;
  reason: string;
  /** ISO 8601 datetime string, e.g. 2026-08-10T14:30:00 */
  datetime: string;
  /** True if the visitor showed up without a prior scheduled slot. */
  isWalkIn: boolean;
  /** Whether the "starting now" notification has already fired */
  notifiedStart?: boolean;
  /** Whether the "coming up soon" reminder has already fired */
  notifiedReminder?: boolean;
  createdAt: string;
}

export type AppointmentDraft = Omit<
  Appointment,
  "id" | "createdAt" | "notifiedStart" | "notifiedReminder"
>;

export type AppointmentStatus = "past" | "soon" | "upcoming";

export interface UnavailablePeriod {
  id: string;
  /** Date-only ISO string, e.g. 2026-08-10 */
  from: string;
  /** Date-only ISO string, e.g. 2026-08-16 */
  to: string;
  label: string;
  createdAt: string;
}

export type UnavailableDraft = Omit<UnavailablePeriod, "id" | "createdAt">;

export interface Personnel {
  id: string;
  name: string;
  createdAt: string;
}

export type PersonnelDraft = Omit<Personnel, "id" | "createdAt">;

export interface Assignment {
  id: string;
  personnelId: string;
  /** Denormalized at write time so the card doesn't need a lookup to render. */
  personnelName: string;
  description: string;
  /** ISO 8601 datetime string, e.g. 2026-08-10T14:30:00 */
  datetime: string;
  createdAt: string;
}

export type AssignmentDraft = Omit<Assignment, "id" | "createdAt">;
