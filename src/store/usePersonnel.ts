import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { Personnel, PersonnelDraft } from "../types";
import { db, ensureSignedIn } from "../lib/firebase";

const COLLECTION = "personnel";
const ASSIGNMENTS_COLLECTION = "assignments";

export function usePersonnel() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    ensureSignedIn().then(() => {
      const q = query(collection(db, COLLECTION), orderBy("name"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setPersonnel(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Personnel, "id">),
          })),
        );
      });
    });

    return () => unsubscribe?.();
  }, []);

  const addPersonnel = useCallback(async (draft: PersonnelDraft) => {
    await addDoc(collection(db, COLLECTION), {
      ...draft,
      createdAt: new Date().toISOString(),
    });
  }, []);

  // Also refreshes the denormalized `personnelName` on every assignment that
  // references this person, so a rename doesn't leave stale names sitting
  // on their existing assignments.
  const updatePersonnel = useCallback(
    async (id: string, draft: PersonnelDraft) => {
      await updateDoc(doc(db, COLLECTION, id), { ...draft });

      const affected = await getDocs(
        query(
          collection(db, ASSIGNMENTS_COLLECTION),
          where("personnelId", "==", id),
        ),
      );
      if (affected.empty) return;

      const batch = writeBatch(db);
      affected.forEach((docSnap) => {
        batch.update(docSnap.ref, { personnelName: draft.name });
      });
      await batch.commit();
    },
    [],
  );

  const removePersonnel = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  return { personnel, addPersonnel, updatePersonnel, removePersonnel };
}
