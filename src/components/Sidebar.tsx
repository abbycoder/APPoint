import {
  Appointment,
  Assignment,
  Personnel,
  UnavailablePeriod,
} from "../types";
import { useClock } from "../store/useClock";
import { formatClock, isSameDay, getStatus, itemsInMonth } from "../lib/time";
import {
  exportAppointmentsToPdf,
  exportAssignmentsToPdf,
} from "../lib/exportPdf";
import { openExternalLink } from "../lib/openExternalLink";
import { UpcomingModal } from "./UpcomingModal";
import { useState } from "react";

export type SidebarMode = "appointments" | "personnel";

interface SidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  /** The month currently showing on whichever calendar is active — exports are scoped to this. */
  monthCursor: Date;
  showToast: (message: string, variant?: "success" | "error") => void;

  appointments: Appointment[];
  unavailablePeriods: UnavailablePeriod[];
  onNewAppointment: () => void;
  onMarkUnavailable: () => void;
  onViewUnavailable: () => void;

  assignments: Assignment[];
  personnel: Personnel[];
  onNewAssignment: () => void;
  onAddPersonnel: () => void;
  onViewPersonnel: () => void;
}

function getBlockedDayCount(periods: UnavailablePeriod[]) {
  return periods.reduce((total, period) => {
    const start = new Date(`${period.from}T00:00:00`);
    const end = new Date(`${period.to}T00:00:00`);

    const diff =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return total + Math.max(diff, 1);
  }, 0);
}

export function Sidebar({
  mode,
  onModeChange,
  monthCursor,
  showToast,
  appointments,
  unavailablePeriods,
  onNewAppointment,
  onMarkUnavailable,
  onViewUnavailable,
  assignments,
  personnel,
  onNewAssignment,
  onAddPersonnel,
  onViewPersonnel,
}: SidebarProps) {
  const now = useClock();
  const [upcomingOpen, setUpcomingOpen] = useState(false);

  const items: (Appointment | Assignment)[] =
    mode === "appointments" ? appointments : assignments;

  const today = items.filter((a) => isSameDay(new Date(a.datetime), now));

  const soon = items.filter((a) => getStatus(a.datetime, now) === "soon");

  const upcoming = items.filter(
    (a) => getStatus(a.datetime, now) === "upcoming",
  );

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const itemsThisMonth = itemsInMonth(items, monthCursor);

  const blockedDayCount = getBlockedDayCount(unavailablePeriods);

  return (
    <>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-rule bg-ink px-6 py-8 text-paper">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
            })}
          </p>

          <p className="mt-1 font-display text-2xl leading-tight">
            {now.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </p>

          <p className="mt-3 font-mono text-3xl tabular tracking-tight text-navy-light">
            {formatClock(now)}
          </p>

          <div className="mt-7 flex rounded-md border border-paper/15 bg-paper/5 p-0.5">
            <ModeTab
              label="Appointments"
              active={mode === "appointments"}
              onClick={() => onModeChange("appointments")}
            />

            <ModeTab
              label="Personnel"
              active={mode === "personnel"}
              onClick={() => onModeChange("personnel")}
            />
          </div>

          <button
            onClick={
              mode === "appointments" ? onNewAppointment : onNewAssignment
            }
            className="mt-4 w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-navy-light active:scale-[0.98]"
          >
            {mode === "appointments" ? "New appointment" : "New assignment"}
          </button>

          <button
            onClick={() => {
              try {
                const filename =
                  mode === "appointments"
                    ? exportAppointmentsToPdf(
                        itemsInMonth(
                          appointments,
                          monthCursor,
                        ) as Appointment[],
                      )
                    : exportAssignmentsToPdf(
                        itemsInMonth(assignments, monthCursor) as Assignment[],
                      );

                showToast(`Saved "${filename}" to your Downloads folder`);
              } catch {
                showToast("Export failed — please try again.", "error");
              }
            }}
            disabled={itemsThisMonth.length === 0}
            title={`Export ${monthLabel}`}
            className="mt-3 w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-center text-xs font-medium text-paper transition hover:bg-paper/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-paper/5"
          >
            Export {monthLabel} (.pdf)
          </button>

          {/* Today / Starting Soon / Upcoming */}
          <div className="mt-10 grid grid-cols-3 gap-2">
            <StatCard label="Today" value={today.length} />

            <StatCard label="Starting soon" value={soon.length} accent />

            <StatCard
              label="Upcoming"
              value={upcoming.length}
              onClick={() => setUpcomingOpen(true)}
            />
          </div>
        </div>

        {mode === "appointments" ? (
          <div className="mt-8 flex flex-col gap-2 border-t border-paper/10 pt-6">
            <button
              onClick={onMarkUnavailable}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              Mark Unavailable
            </button>

            <button
              onClick={onViewUnavailable}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              View Unavailable
            </button>

            <p className="mt-1 text-center text-xs text-paper/40">
              {blockedDayCount} {blockedDayCount === 1 ? "day" : "days"} blocked
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-2 border-t border-paper/10 pt-6">
            <button
              onClick={onAddPersonnel}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              Add Personnel
            </button>

            <button
              onClick={onViewPersonnel}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              View Personnel
            </button>

            <p className="mt-1 text-center text-xs text-paper/40">
              {personnel.length} {personnel.length === 1 ? "person" : "people"}{" "}
              has been added
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-paper/10 pt-5">
          <p className="font-mono text-[11px] leading-relaxed text-paper/40">
            {mode === "appointments" ? (
              <>
                <span className="font-bold text-paper/80">NOTE:</span> Notifications fire{" "}
                <span className="text-paper/60">15 min before</span> each
                appointment, and again when it starts.
              </>
            ) : (
              <>
                <span className="font-bold text-paper/80">NOTE:</span> Assignments sync live across every device signed in to this app.
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-paper/30">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://andreiadlawan.vercel.app/"
            onClick={(e) => {
              e.preventDefault();
              openExternalLink("https://andreiadlawan.vercel.app/");
            }}
            className="cursor-pointer text-paper/50 underline decoration-paper/20 underline-offset-2 hover:text-paper/80"
          >
            Andrei Gabrielle Adlawan
          </a>
        </p>
      </aside>

      {upcomingOpen && (
        <UpcomingModal
          mode={mode}
          items={upcoming}
          onClose={() => setUpcomingOpen(false)}
        />
      )}
    </>
  );
}

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
        active ? "bg-navy text-paper" : "text-paper/60 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  accent?: boolean;
  onClick?: () => void;
}) {
  const className =
    "rounded-md border border-paper/10 bg-paper/5 px-2 py-3 text-center transition " +
    (onClick
      ? "cursor-pointer hover:border-paper/20 hover:bg-paper/10 active:scale-[0.98]"
      : "");

  const content = (
    <>
      <p className="min-h-[24px] text-[9px] font-medium uppercase leading-3 tracking-wide text-paper/50">
        {label === "Starting soon" ? (
          <>
            Starting
            <br />
            soon
          </>
        ) : (
          label
        )}
      </p>

      <p
        className={`mt-1 font-mono text-2xl font-medium tabular ${
          accent && value > 0 ? "text-amber-light" : "text-paper"
        }`}
      >
        {value}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
