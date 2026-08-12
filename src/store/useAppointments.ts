import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Appointment, AppointmentDraft } from "../types";
import { db, ensureSignedIn } from "../lib/firebase";

const COLLECTION = "appointments";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    ensureSignedIn().then(() => {
      const q = query(collection(db, COLLECTION), orderBy("datetime"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setAppointments(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Appointment, "id">),
          })),
        );
        setIsLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const addAppointment = useCallback(async (draft: AppointmentDraft) => {
    await addDoc(collection(db, COLLECTION), {
      ...draft,
      notifiedStart: false,
      notifiedReminder: false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  // Any edit re-arms both notifications — simpler and safer than trying to
  // detect whether the time specifically changed.
  const updateAppointment = useCallback(
    async (id: string, draft: AppointmentDraft) => {
      await updateDoc(doc(db, COLLECTION, id), {
        ...draft,
        notifiedStart: false,
        notifiedReminder: false,
      });
    },
    [],
  );

  const deleteAppointment = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  const markNotified = useCallback(
    async (id: string, field: "notifiedStart" | "notifiedReminder") => {
      await updateDoc(doc(db, COLLECTION, id), { [field]: true });
    },
    [],
  );

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markNotified,
  };
}
