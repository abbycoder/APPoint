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
import { Assignment, AssignmentDraft } from "../types";
import { db, ensureSignedIn } from "../lib/firebase";

const COLLECTION = "assignments";

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    ensureSignedIn().then(() => {
      const q = query(collection(db, COLLECTION), orderBy("datetime"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setAssignments(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Assignment, "id">),
          })),
        );
        setIsLoading(false);
      });
    });

    return () => unsubscribe?.();
  }, []);

  const addAssignment = useCallback(async (draft: AssignmentDraft) => {
    await addDoc(collection(db, COLLECTION), {
      ...draft,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const updateAssignment = useCallback(
    async (id: string, draft: AssignmentDraft) => {
      await updateDoc(doc(db, COLLECTION, id), { ...draft });
    },
    [],
  );

  const deleteAssignment = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  return {
    assignments,
    isLoading,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
