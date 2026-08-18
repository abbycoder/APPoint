import { useEffect, useState } from "react";
import type { Update } from "@tauri-apps/plugin-updater";

import { Download, RefreshCw, X } from "lucide-react";

import {
  Appointment,
  AppointmentDraft,
  Assignment,
  AssignmentDraft,
  Personnel,
  PersonnelDraft,
  UnavailablePeriod,
  UnavailableDraft,
} from "./types";

import { useAppointments } from "./store/useAppointments";
import { useUnavailablePeriods } from "./store/useUnavailablePeriods";
import { usePersonnel } from "./store/usePersonnel";
import { useAssignments } from "./store/useAssignments";
import { useNotificationScheduler } from "./store/useNotificationScheduler";

import { Sidebar, SidebarMode } from "./components/Sidebar";
import { CalendarView } from "./components/CalendarView";
import { PersonnelCalendarView } from "./components/PersonnelCalendarView";
import { AppointmentForm } from "./components/AppointmentForm";
import { AssignmentForm } from "./components/AssignmentForm";
import { UnavailableForm } from "./components/UnavailableForm";
import { UnavailableListModal } from "./components/UnavailableListModal";
import { PersonnelForm } from "./components/PersonnelForm";
import { PersonnelListModal } from "./components/PersonnelListModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Toast } from "./components/Toast";

import { useToast } from "./store/useToast";

import { checkForUpdates, installUpdate } from "./lib/updater";

// --------------------------------------------------
// Loading State
// --------------------------------------------------

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16">
          {/* Face */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="#EFF6FF"
            stroke="#DBEAFE"
            strokeWidth="2"
          />

          {/* Progress arc sweeping around the rim */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="44 176"
            opacity="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 32 32"
              to="360 32 32"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Hour ticks */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="32"
              y1="6"
              x2="32"
              y2="10"
              stroke="#93C5FD"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${deg} 32 32)`}
            />
          ))}

          {/* Hour hand */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="20"
            stroke="#1E3A8A"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 32 32"
              to="360 32 32"
              dur="7s"
              repeatCount="indefinite"
            />
          </line>

          {/* Minute hand */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="12"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 32 32"
              to="360 32 32"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </line>

          {/* Center pin */}
          <circle cx="32" cy="32" r="2.5" fill="#1E3A8A" />
        </svg>
      </div>

      <p className="mt-5 text-sm font-medium text-ink/60">{message}</p>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<SidebarMode>("appointments");

  // --------------------------------------------------
  // Updater
  // --------------------------------------------------

  const [availableUpdate, setAvailableUpdate] = useState<Update | null>(null);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateMenu, setShowUpdateMenu] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // --------------------------------------------------
  // Automatic update check
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function checkForAppUpdate() {
      try {
        const update = await checkForUpdates();

        if (!cancelled && update) {
          setAvailableUpdate(update);
        }
      } catch (error) {
        console.error("Automatic update check failed:", error);

        // Don't interrupt the user with an error on startup.
        // They can use "Check for Updates" manually.
      }
    }

    const timer = window.setTimeout(() => {
      checkForAppUpdate();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // --------------------------------------------------
  // Manual update check
  // --------------------------------------------------

  async function handleCheckForUpdates() {
    if (checkingForUpdate || isUpdating) {
      return;
    }

    try {
      setCheckingForUpdate(true);
      setUpdateError(null);
      setUpdateMessage(null);

      const update = await checkForUpdates();

      if (update) {
        setAvailableUpdate(update);
        setShowUpdateMenu(true);
        return;
      }

      setAvailableUpdate(null);
      setUpdateMessage("You're already using the latest version.");

      window.setTimeout(() => {
        setUpdateMessage(null);
      }, 4000);
    } catch (error) {
      console.error("Update check failed:", error);

      setUpdateError("Unable to check for updates. Please try again later.");

      window.setTimeout(() => {
        setUpdateError(null);
      }, 5000);
    } finally {
      setCheckingForUpdate(false);
    }
  }

  // --------------------------------------------------
  // Install update
  // --------------------------------------------------

  async function handleInstallUpdate() {
    if (!availableUpdate || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);

      await installUpdate(availableUpdate);
    } catch (error) {
      console.error("Update installation failed:", error);

      setIsUpdating(false);

      setUpdateError("Unable to install the update. Please try again later.");
    }
  }

  // --------------------------------------------------
  // Toast
  // --------------------------------------------------

  const { toast, showToast } = useToast();

  // --------------------------------------------------
  // Calendar
  // --------------------------------------------------

  const today = new Date();

  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // --------------------------------------------------
  // Appointments
  // --------------------------------------------------

  const {
    appointments,
    isLoading: appointmentsLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markNotified,
  } = useAppointments();

  const { periods, addPeriod, updatePeriod, removePeriod } =
    useUnavailablePeriods();

  useNotificationScheduler(appointments, markNotified);

  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [apptFormOpen, setApptFormOpen] = useState(false);
  const [apptPrefillDate, setApptPrefillDate] = useState<string | null>(null);

  const [deleteApptTarget, setDeleteApptTarget] = useState<Appointment | null>(
    null,
  );

  const [unavailableFormOpen, setUnavailableFormOpen] = useState(false);
  const [unavailableListOpen, setUnavailableListOpen] = useState(false);

  const [editingPeriod, setEditingPeriod] = useState<UnavailablePeriod | null>(
    null,
  );

  const [deletePeriodTarget, setDeletePeriodTarget] =
    useState<UnavailablePeriod | null>(null);

  function openNewAppointment(date?: Date) {
    setEditingAppt(null);
    setApptPrefillDate(date ? date.toISOString() : null);
    setApptFormOpen(true);
  }

  function openEditAppointment(appt: Appointment) {
    setEditingAppt(appt);
    setApptPrefillDate(null);
    setApptFormOpen(true);
  }

  function openNewPeriod() {
    setEditingPeriod(null);
    setUnavailableFormOpen(true);
  }

  function openEditPeriod(p: UnavailablePeriod) {
    setEditingPeriod(p);
    setUnavailableFormOpen(true);
  }

  function handleSavePeriod(draft: UnavailableDraft) {
    if (editingPeriod) {
      updatePeriod(editingPeriod.id, draft);
    } else {
      addPeriod(draft);
    }

    setUnavailableFormOpen(false);
    setEditingPeriod(null);
  }

  function handleDeletePeriod(id: string) {
    setDeletePeriodTarget(periods.find((p) => p.id === id) ?? null);
  }

  function confirmDeletePeriod() {
    if (deletePeriodTarget) {
      removePeriod(deletePeriodTarget.id);
    }

    setDeletePeriodTarget(null);
  }

  function handleSaveAppointment(draft: AppointmentDraft) {
    if (editingAppt) {
      updateAppointment(editingAppt.id, draft);
    } else {
      addAppointment(draft);
    }

    setApptFormOpen(false);
    setEditingAppt(null);
    setApptPrefillDate(null);
  }

  function handleDeleteAppointment(id: string) {
    setDeleteApptTarget(appointments.find((a) => a.id === id) ?? null);
  }

  function confirmDeleteAppointment() {
    if (deleteApptTarget) {
      deleteAppointment(deleteApptTarget.id);
    }

    setDeleteApptTarget(null);
  }

  // --------------------------------------------------
  // Personnel / Assignments
  // --------------------------------------------------

  const { personnel, addPersonnel, updatePersonnel, removePersonnel } =
    usePersonnel();

  const {
    assignments,
    isLoading: assignmentsLoading,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAssignments();

  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );

  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);

  const [assignmentPrefillDate, setAssignmentPrefillDate] = useState<
    string | null
  >(null);

  const [deleteAssignmentTarget, setDeleteAssignmentTarget] =
    useState<Assignment | null>(null);

  function openNewAssignment(date?: Date) {
    setEditingAssignment(null);
    setAssignmentPrefillDate(date ? date.toISOString() : null);
    setAssignmentFormOpen(true);
  }

  function openEditAssignment(a: Assignment) {
    setEditingAssignment(a);
    setAssignmentPrefillDate(null);
    setAssignmentFormOpen(true);
  }

  function handleSaveAssignment(draft: AssignmentDraft) {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, draft);
    } else {
      addAssignment(draft);
    }

    setAssignmentFormOpen(false);
    setEditingAssignment(null);
    setAssignmentPrefillDate(null);
  }

  function handleDeleteAssignment(id: string) {
    setDeleteAssignmentTarget(assignments.find((a) => a.id === id) ?? null);
  }

  function confirmDeleteAssignment() {
    if (deleteAssignmentTarget) {
      deleteAssignment(deleteAssignmentTarget.id);
    }

    setDeleteAssignmentTarget(null);
  }

  // --------------------------------------------------
  // Personnel
  // --------------------------------------------------

  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(
    null,
  );

  const [personnelFormOpen, setPersonnelFormOpen] = useState(false);
  const [personnelListOpen, setPersonnelListOpen] = useState(false);

  const [deletePersonnelTarget, setDeletePersonnelTarget] =
    useState<Personnel | null>(null);

  function openNewPersonnel() {
    setEditingPersonnel(null);
    setPersonnelFormOpen(true);
  }

  function openEditPersonnel(p: Personnel) {
    setEditingPersonnel(p);
    setPersonnelFormOpen(true);
  }

  function handleSavePersonnel(draft: PersonnelDraft) {
    if (editingPersonnel) {
      updatePersonnel(editingPersonnel.id, draft);
    } else {
      addPersonnel(draft);
    }

    setPersonnelFormOpen(false);
    setEditingPersonnel(null);
  }

  function handleDeletePersonnel(id: string) {
    setDeletePersonnelTarget(personnel.find((p) => p.id === id) ?? null);
  }

  function confirmDeletePersonnel() {
    if (deletePersonnelTarget) {
      removePersonnel(deletePersonnelTarget.id);
    }

    setDeletePersonnelTarget(null);
  }

  const isAppointments = mode === "appointments";

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-paper">
      {/* ==================================================
          UPDATE DOWNLOAD BUTTON
          ================================================== */}

      {availableUpdate && (
        <button
          type="button"
          onClick={() => {
            setUpdateError(null);
            setShowUpdateMenu(true);
          }}
          disabled={isUpdating}
          title={`Update APPoint to version ${availableUpdate.version}`}
          aria-label={`Update APPoint to version ${availableUpdate.version}`}
          className="fixed right-6 top-6 z-[90] flex h-11 w-11 items-center justify-center rounded-full bg-navy text-paper shadow-lg transition-all hover:scale-105 hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUpdating ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}

          {!isUpdating && (
            <span
              className="absolute right-0 top-0 h-3 w-3 rounded-full bg-blue-400 ring-2 ring-white"
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {/* ==================================================
          UPDATE POPOVER
          ================================================== */}

      {showUpdateMenu && availableUpdate && (
        <div className="fixed right-6 top-[4.75rem] z-[100] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
          {/* Header */}

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Download className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold text-ink">
                Update available
              </h2>

              <p className="mt-1 text-sm text-ink/60">
                A newer version of APPoint is ready.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUpdateMenu(false)}
              disabled={isUpdating}
              aria-label="Close update notification"
              className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Version information */}

          <div className="mt-5 rounded-xl bg-paper p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/55">Current version</span>

              <span className="font-medium text-ink">
                {availableUpdate.currentVersion}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-ink/55">New version</span>

              <span className="font-semibold text-blue-600">
                {availableUpdate.version}
              </span>
            </div>
          </div>

          {/* Release notes */}

          {availableUpdate.body && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                What's new
              </p>

              <div className="mt-2 max-h-36 overflow-y-auto whitespace-pre-line text-sm leading-6 text-ink/70">
                {availableUpdate.body}
              </div>
            </div>
          )}

          {/* Error */}

          {updateError && (
            <div className="mt-4 rounded-xl bg-red-50 p-3">
              <p className="text-sm text-red-700">{updateError}</p>
            </div>
          )}

          {/* Actions */}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setShowUpdateMenu(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Later
            </button>

            <button
              type="button"
              onClick={handleInstallUpdate}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update now"
              )}
            </button>
          </div>

          {isUpdating && (
            <p className="mt-3 text-center text-xs text-ink/50">
              APPoint will restart automatically when the update is installed.
            </p>
          )}
        </div>
      )}

      {/* ==================================================
          UPDATE STATUS TOASTS
          ================================================== */}

      {updateMessage && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-xl">
          <p className="text-sm font-medium text-ink">{updateMessage}</p>
        </div>
      )}

      {updateError && !showUpdateMenu && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 shadow-xl">
          <p className="text-sm text-red-700">{updateError}</p>
        </div>
      )}

      {/* ==================================================
          SIDEBAR
          ================================================== */}

      <Sidebar
        mode={mode}
        onModeChange={setMode}
        monthCursor={monthCursor}
        showToast={showToast}
        appointments={appointments}
        unavailablePeriods={periods}
        onNewAppointment={() => openNewAppointment()}
        onMarkUnavailable={openNewPeriod}
        onViewUnavailable={() => setUnavailableListOpen(true)}
        assignments={assignments}
        personnel={personnel}
        onNewAssignment={() => openNewAssignment()}
        onAddPersonnel={openNewPersonnel}
        onViewPersonnel={() => setPersonnelListOpen(true)}
      />

      {/* ==================================================
          MAIN CONTENT
          ================================================== */}

      <main className="flex-1 overflow-y-auto px-10 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-3xl font-bold text-ink">
              APPoint
            </h1>

            <span className="text-sm italic text-ink/60">
              Your appointments, simplified.
            </span>
          </div>

          <p className="mt-2 text-sm text-ink/60">
            {isAppointments
              ? "Who's visiting, when, and why."
              : "Who's assigned where, and when."}
          </p>

          {/* ==================================================
              MANUAL UPDATE CHECK
              ================================================== */}

          <div className="mt-4 flex items-center">
            <button
              type="button"
              onClick={handleCheckForUpdates}
              disabled={checkingForUpdate || isUpdating}
              className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-ink/65 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  checkingForUpdate ? "animate-spin" : ""
                }`}
              />

              {checkingForUpdate
                ? "Checking for updates..."
                : "Check for Updates"}
            </button>
          </div>

          <div className="mt-8">
            {isAppointments ? (
              appointmentsLoading ? (
                <LoadingState message="Loading appointments..." />
              ) : (
                <CalendarView
                  appointments={appointments}
                  unavailablePeriods={periods}
                  monthCursor={monthCursor}
                  onMonthChange={setMonthCursor}
                  onEdit={openEditAppointment}
                  onDelete={handleDeleteAppointment}
                  onNew={openNewAppointment}
                />
              )
            ) : assignmentsLoading ? (
              <LoadingState message="Loading assignments..." />
            ) : (
              <PersonnelCalendarView
                assignments={assignments}
                monthCursor={monthCursor}
                onMonthChange={setMonthCursor}
                onEdit={openEditAssignment}
                onDelete={handleDeleteAssignment}
                onNew={openNewAssignment}
              />
            )}
          </div>
        </div>
      </main>

      {/* ==================================================
          APPOINTMENT FORM
          ================================================== */}

      {apptFormOpen && (
        <AppointmentForm
          initial={editingAppt}
          initialDate={apptPrefillDate}
          unavailablePeriods={periods}
          onSave={handleSaveAppointment}
          onClose={() => {
            setApptFormOpen(false);
            setEditingAppt(null);
            setApptPrefillDate(null);
          }}
        />
      )}

      {/* ==================================================
          UNAVAILABLE LIST
          ================================================== */}

      {unavailableListOpen && (
        <UnavailableListModal
          periods={periods}
          onAdd={openNewPeriod}
          onEdit={openEditPeriod}
          onDelete={handleDeletePeriod}
          onClose={() => setUnavailableListOpen(false)}
        />
      )}

      {/* ==================================================
          UNAVAILABLE FORM
          ================================================== */}

      {unavailableFormOpen && (
        <UnavailableForm
          initial={editingPeriod}
          onSave={handleSavePeriod}
          onClose={() => {
            setUnavailableFormOpen(false);
            setEditingPeriod(null);
          }}
        />
      )}

      {/* ==================================================
          DELETE UNAVAILABLE PERIOD
          ================================================== */}

      {deletePeriodTarget && (
        <ConfirmDialog
          title="Delete this unavailable period?"
          description={`${deletePeriodTarget.label} — this can't be undone.`}
          onConfirm={confirmDeletePeriod}
          onCancel={() => setDeletePeriodTarget(null)}
        />
      )}

      {/* ==================================================
          DELETE APPOINTMENT
          ================================================== */}

      {deleteApptTarget && (
        <ConfirmDialog
          title="Delete this appointment?"
          description={`${deleteApptTarget.name} · ${deleteApptTarget.organization} — this can't be undone.`}
          onConfirm={confirmDeleteAppointment}
          onCancel={() => setDeleteApptTarget(null)}
        />
      )}

      {/* ==================================================
          ASSIGNMENT FORM
          ================================================== */}

      {assignmentFormOpen && (
        <AssignmentForm
          initial={editingAssignment}
          initialDate={assignmentPrefillDate}
          personnel={personnel}
          onSave={handleSaveAssignment}
          onClose={() => {
            setAssignmentFormOpen(false);
            setEditingAssignment(null);
            setAssignmentPrefillDate(null);
          }}
        />
      )}

      {/* ==================================================
          DELETE ASSIGNMENT
          ================================================== */}

      {deleteAssignmentTarget && (
        <ConfirmDialog
          title="Delete this assignment?"
          description={`${deleteAssignmentTarget.personnelName} · ${deleteAssignmentTarget.description} — this can't be undone.`}
          onConfirm={confirmDeleteAssignment}
          onCancel={() => setDeleteAssignmentTarget(null)}
        />
      )}

      {/* ==================================================
          PERSONNEL LIST
          ================================================== */}

      {personnelListOpen && (
        <PersonnelListModal
          personnel={personnel}
          assignments={assignments}
          onAdd={openNewPersonnel}
          onEdit={openEditPersonnel}
          onDelete={handleDeletePersonnel}
          onClose={() => setPersonnelListOpen(false)}
        />
      )}

      {/* ==================================================
          PERSONNEL FORM
          ================================================== */}

      {personnelFormOpen && (
        <PersonnelForm
          initial={editingPersonnel}
          onSave={handleSavePersonnel}
          onClose={() => {
            setPersonnelFormOpen(false);
            setEditingPersonnel(null);
          }}
        />
      )}

      {/* ==================================================
          DELETE PERSONNEL
          ================================================== */}

      {deletePersonnelTarget && (
        <ConfirmDialog
          title="Delete this person?"
          description={`${deletePersonnelTarget.name} will be removed from the list. Their existing assignments will keep this name but won't be linked to anyone. This can't be undone.`}
          onConfirm={confirmDeletePersonnel}
          onCancel={() => setDeletePersonnelTarget(null)}
        />
      )}

      {/* ==================================================
          TOAST
          ================================================== */}

      <Toast toast={toast} />
    </div>
  );
}
