import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Personnel, PersonnelDraft } from "../types";
import { db, ensureSignedIn } from "../lib/firebase";

const COLLECTION = "personnel";

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

  const removePersonnel = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  return { personnel, addPersonnel, removePersonnel };
}
