import { useEffect, useRef } from "react";
import { Appointment } from "../types";
import { minutesUntil, REMINDER_LEAD_MINUTES } from "../lib/time";
import { ensureNotificationPermission, notify } from "../lib/notifications";

const CHECK_INTERVAL_MS = 20_000;

export function useNotificationScheduler(
  appointments: Appointment[],
  markNotified: (id: string, field: "notifiedStart" | "notifiedReminder") => void
) {
  const appointmentsRef = useRef(appointments);
  appointmentsRef.current = appointments;

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      for (const appt of appointmentsRef.current) {
        const diff = minutesUntil(new Date(appt.datetime), now);

        if (!appt.notifiedReminder && diff > 0 && diff <= REMINDER_LEAD_MINUTES) {
          notify(
            "Upcoming appointment",
            `${appt.name} in ${diff} min · ${appt.organization}`
          );
          markNotified(appt.id, "notifiedReminder");
        }

        if (!appt.notifiedStart && diff <= 0 && diff > -2) {
          notify(
            "Appointment starting now",
            `${appt.name} · ${appt.organization} · ${appt.reason}`
          );
          markNotified(appt.id, "notifiedStart");
        }
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [markNotified]);
}
