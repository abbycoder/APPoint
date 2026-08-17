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
import { UnavailableDraft, UnavailablePeriod } from "../types";
import { db, ensureSignedIn } from "../lib/firebase";

const COLLECTION = "unavailablePeriods";

export function useUnavailablePeriods() {
  const [periods, setPeriods] = useState<UnavailablePeriod[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    ensureSignedIn().then(() => {
      const q = query(collection(db, COLLECTION), orderBy("from"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setPeriods(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<UnavailablePeriod, "id">),
          })),
        );
      });
    });

    return () => unsubscribe?.();
  }, []);

  const addPeriod = useCallback(async (draft: UnavailableDraft) => {
    await addDoc(collection(db, COLLECTION), {
      ...draft,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const updatePeriod = useCallback(
    async (id: string, draft: UnavailableDraft) => {
      await updateDoc(doc(db, COLLECTION, id), { ...draft });
    },
    [],
  );

  const removePeriod = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  return { periods, addPeriod, updatePeriod, removePeriod };
}
