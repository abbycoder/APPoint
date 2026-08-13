import { useState } from "react";
import {
  Appointment,
  AppointmentDraft,
  Assignment,
  AssignmentDraft,
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
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Toast } from "./components/Toast";
import { useToast } from "./store/useToast";

export default function App() {
  const [mode, setMode] = useState<SidebarMode>("appointments");
  const { toast, showToast } = useToast();

  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // Appointments
  const {
    appointments,
    isLoading: appointmentsLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markNotified,
  } = useAppointments();
  const { periods, addPeriod, removePeriod } = useUnavailablePeriods();
  useNotificationScheduler(appointments, markNotified);

  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [apptFormOpen, setApptFormOpen] = useState(false);
  const [apptPrefillDate, setApptPrefillDate] = useState<string | null>(null);
  const [deleteApptTarget, setDeleteApptTarget] = useState<Appointment | null>(
    null,
  );
  const [unavailableFormOpen, setUnavailableFormOpen] = useState(false);

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
    if (deleteApptTarget) deleteAppointment(deleteApptTarget.id);
    setDeleteApptTarget(null);
  }

  // Personnel
  const { personnel, addPersonnel, removePersonnel } = usePersonnel();
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
    if (deleteAssignmentTarget) deleteAssignment(deleteAssignmentTarget.id);
    setDeleteAssignmentTarget(null);
  }

  const isAppointments = mode === "appointments";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper">
      <Sidebar
        mode={mode}
        onModeChange={setMode}
        monthCursor={monthCursor}
        showToast={showToast}
        appointments={appointments}
        unavailablePeriods={periods}
        onNewAppointment={() => openNewAppointment()}
        onMarkUnavailable={() => setUnavailableFormOpen(true)}
        onRemoveUnavailable={removePeriod}
        assignments={assignments}
        personnel={personnel}
        onNewAssignment={() => openNewAssignment()}
        onAddPersonnel={(name) => addPersonnel({ name })}
        onRemovePersonnel={removePersonnel}
      />

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

      {unavailableFormOpen && (
        <UnavailableForm
          onSave={(draft) => {
            addPeriod(draft);
            setUnavailableFormOpen(false);
          }}
          onClose={() => setUnavailableFormOpen(false)}
        />
      )}

      {deleteApptTarget && (
        <ConfirmDialog
          title="Delete this appointment?"
          description={`${deleteApptTarget.name} · ${deleteApptTarget.organization} — this can't be undone.`}
          onConfirm={confirmDeleteAppointment}
          onCancel={() => setDeleteApptTarget(null)}
        />
      )}

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

      {deleteAssignmentTarget && (
        <ConfirmDialog
          title="Delete this assignment?"
          description={`${deleteAssignmentTarget.personnelName} · ${deleteAssignmentTarget.description} — this can't be undone.`}
          onConfirm={confirmDeleteAssignment}
          onCancel={() => setDeleteAssignmentTarget(null)}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
