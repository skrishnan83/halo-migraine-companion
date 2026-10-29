// LOCAL-FIRST SAVING: logs and relief ratings are stored on the phone first, then
// uploaded to Firebase whenever there is internet. Each log gets its ID on the phone,
// so retrying an upload can never create a duplicate.
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import type { Relief } from "../utils/relief";
import { db } from "./firebase";

export type PendingAttack = {
  id: string;
  severity: number;
  startedAtMs: number;
  symptoms: string[];
  note: string;
  createdAtMs: number;
  relief?: Relief;
};

// A relief rating for a log that is already in the database.
export type PendingRelief = { id: string; relief: Relief };

const pendingKey = (uid: string) => `halo.pending.${uid}`;
const reliefKey = (uid: string) => `halo.pendingRelief.${uid}`;

// Lets screens know when the waiting lists change.
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

async function readList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function writeList<T>(key: string, list: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
  notify();
}

export function getPending(uid: string) {
  return readList<PendingAttack>(pendingKey(uid));
}

export function getPendingRelief(uid: string) {
  return readList<PendingRelief>(reliefKey(uid));
}

// Saves a log on the phone. Works with no internet.
export async function queueAttack(
  uid: string,
  data: Omit<PendingAttack, "id" | "createdAtMs" | "relief">,
): Promise<PendingAttack> {
  const id = doc(collection(db, "users", uid, "attacks")).id; // made on the phone
  const attack: PendingAttack = { ...data, id, createdAtMs: Date.now() };
  const list = await getPending(uid);
  await writeList(pendingKey(uid), [...list, attack]);
  return attack;
}

// Saves a relief rating on the phone. Works with no internet.
export async function queueRelief(
  uid: string,
  attackId: string,
  relief: Relief,
) {
  // Log still waiting to upload? Add the rating to it, so both go up together.
  const attacks = await getPending(uid);
  if (attacks.some((a) => a.id === attackId)) {
    await writeList(
      pendingKey(uid),
      attacks.map((a) => (a.id === attackId ? { ...a, relief } : a)),
    );
    return;
  }
  // Otherwise keep the newest rating for this log.
  const list = await getPendingRelief(uid);
  await writeList(reliefKey(uid), [
    ...list.filter((r) => r.id !== attackId),
    { id: attackId, relief },
  ]);
}

function reliefForDatabase(r: Relief) {
  return {
    medication: r.medication,
    level: r.level,
    minutesToRelief: r.minutesToRelief,
    ratedAt: Timestamp.fromMillis(r.ratedAtMs),
  };
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
      },
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

    // 1. New logs (with their rating, if they already have one).
    for (const a of await getPending(uid)) {
      await withTimeout(
        setDoc(doc(db, "users", uid, "attacks", a.id), {
          severity: a.severity,
          startedAt: Timestamp.fromMillis(a.startedAtMs),
          symptoms: a.symptoms,
          note: a.note,
          status: a.relief ? "ended" : "ongoing",
          createdAt: Timestamp.fromMillis(a.createdAtMs),
          ...(a.relief ? { relief: reliefForDatabase(a.relief) } : {}),
        }),
        10000,
      );
      const current = await getPending(uid);
      await writeList(
        pendingKey(uid),
        current.filter((x) => x.id !== a.id),
      );
    }

    // 2. Ratings for logs that were already uploaded.
    for (const r of await getPendingRelief(uid)) {
      await withTimeout(
        setDoc(
          doc(db, "users", uid, "attacks", r.id),
          { status: "ended", relief: reliefForDatabase(r.relief) },
          { merge: true },
        ),
        10000,
      );
      const current = await getPendingRelief(uid);
      await writeList(
        reliefKey(uid),
        current.filter(
          (x) => !(x.id === r.id && x.relief.ratedAtMs === r.relief.ratedAtMs),
        ),
      );
    }
  } catch (e) {
    console.warn("Sync paused, will retry", e);
  } finally {
    syncing = false;
  }
}
