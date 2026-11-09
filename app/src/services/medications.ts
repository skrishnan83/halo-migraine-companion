// MEDICATIONS SERVICE: load, save and remove the user's medications in Firestore.
// Used by My Medications and How Did It Go?.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Medication = { id: string; name: string; dose: string };

// Listens to the list, sorted by name. Returns a function that stops listening.
export function loadMedications(
  uid: string,
  onList: (meds: Medication[]) => void,
) {
  const q = query(collection(db, "users", uid, "medications"), orderBy("name"));
  return onSnapshot(
    q,
    (snapshot) =>
      onList(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Medication, "id">),
        })),
      ),
    (e) => console.warn("Could not load medications", e),
  );
}

export function saveMedication(uid: string, name: string, dose: string) {
  return addDoc(collection(db, "users", uid, "medications"), {
    name,
    dose,
    createdAt: serverTimestamp(),
  });
}

export function removeMedication(uid: string, id: string) {
  return deleteDoc(doc(db, "users", uid, "medications", id));
}
