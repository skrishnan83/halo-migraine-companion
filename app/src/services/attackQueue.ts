// LOCAL-FIRST SAVING: logs are stored on the phone first, then uploaded to Firebase
// whenever there is internet. Each log gets its ID on the phone, so retrying an
// upload can never create a duplicate.
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type PendingAttack = {
  id: string;
  severity: number;
  startedAtMs: number;
  symptoms: string[];
  note: string;
  createdAtMs: number;
};

const pendingKey = (uid: string) => `halo.pending.${uid}`;

// Lets screens know when the waiting list changes.
const listeners = new Set<() => void>();
export function onPendingChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function notify() {
  listeners.forEach((fn) => fn());
}

export async function getPending(uid: string): Promise<PendingAttack[]> {
  try {
    const raw = await AsyncStorage.getItem(pendingKey(uid));
    return raw ? (JSON.parse(raw) as PendingAttack[]) : [];
  } catch {
    return [];
  }
}

async function savePending(uid: string, list: PendingAttack[]) {
  await AsyncStorage.setItem(pendingKey(uid), JSON.stringify(list));
  notify();
}

// Saves a log on the phone. Works with no internet.
export async function queueAttack(
  uid: string,
  data: Omit<PendingAttack, "id" | "createdAtMs">
): Promise<PendingAttack> {
  const id = doc(collection(db, "users", uid, "attacks")).id; // made on the phone
  const attack: PendingAttack = { ...data, id, createdAtMs: Date.now() };
  const list = await getPending(uid);
  await savePending(uid, [...list, attack]);
  return attack;
}

// Gives up on one upload after a while, so a bad connection can't freeze the sync.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Upload timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

let syncing = false;

// Uploads everything that is waiting. Safe to call as often as you like.
export async function syncPending(uid: string): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected || net.isInternetReachable === false) return;

    const list = await getPending(uid);
    for (const a of list) {
      await withTimeout(
        setDoc(doc(db, "users", uid, "attacks", a.id), {
          severity: a.severity,
          startedAt: Timestamp.fromMillis(a.startedAtMs),
          symptoms: a.symptoms,
          note: a.note,
          status: "ongoing",
          createdAt: Timestamp.fromMillis(a.createdAtMs),
        }),
        10000
      );
      // Uploaded: take it off the waiting list.
      const current = await getPending(uid);
      await savePending(
        uid,
        current.filter((x) => x.id !== a.id)
      );
    }
  } catch (e) {
    console.warn("Sync paused, will retry", e);
  } finally {
    syncing = false;
  }
}