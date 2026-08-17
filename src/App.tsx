import { useEffect, useState } from "react";
import type { Update } from "@tauri-apps/plugin-updater";

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

export default function App() {
  const [mode, setMode] = useState<SidebarMode>("appointments");

  // --------------------------------------------------
  // Updater
  // --------------------------------------------------

  const [availableUpdate, setAvailableUpdate] = useState<Update | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkForAppUpdate() {
      try {
        const update = await checkForUpdates();

        if (!cancelled && update) {
          setAvailableUpdate(update);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setUpdateError(String(error));
        }
      }
    }

    checkForAppUpdate();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleInstallUpdate() {
    if (!availableUpdate) return;

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
    <div className="flex h-screen w-screen overflow-hidden bg-paper">
      {/* ==================================================
          UPDATE DIALOG
          ================================================== */}

      {availableUpdate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-ink">
              APPoint Update Available
            </h2>

            <p className="mt-3 text-sm text-ink/70">
              A new version of APPoint is available.
            </p>

            <div className="mt-4 rounded-xl bg-paper p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/60">Current version</span>

                <span className="font-medium text-ink">
                  {availableUpdate.currentVersion}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-ink/60">New version</span>

                <span className="font-semibold text-ink">
                  {availableUpdate.version}
                </span>
              </div>
            </div>

            {availableUpdate.body && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  What's new
                </p>

                <p className="mt-2 whitespace-pre-line text-sm text-ink/70">
                  {availableUpdate.body}
                </p>
              </div>
            )}

            {updateError && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {updateError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setAvailableUpdate(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/70 hover:bg-black/5 disabled:opacity-50"
              >
                Later
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleInstallUpdate}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Now"}
              </button>
            </div>
          </div>
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
            <h1 className="font-display font-bold text-3xl text-ink">
              APPoint
            </h1>

            <span className="italic text-sm text-ink/60">
              Your appointments, simplified.
            </span>
          </div>

          <p className="mt-2 text-sm text-ink/60">
            {isAppointments
              ? "Who's visiting, when, and why."
              : "Who's assigned where, and when."}
          </p>

          <div className="mt-8">
            {isAppointments ? (
              appointmentsLoading ? (
                <p className="text-sm text-slate">Loading appointments...</p>
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
              <p className="text-sm text-slate">Loading assignments…</p>
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
