// Your attacks, newest first: the cloud list plus anything still waiting on the phone.
// Works offline: shows the last saved list, then live updates when online.
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPending,
  getPendingRelief,
  onPendingChange,
  syncPending,
  type PendingAttack,
  type PendingRelief,
} from "../services/attackQueue";
import { auth, db } from "../services/firebase";
import type { Relief } from "../utils/relief";

export type AttackItem = {
  id: string;
  severity: number;
  startedAtMs: number;
  symptoms: string[];
  note: string;
  relief?: Relief;
  pending: boolean; // true while waiting to upload
};

type ReliefFromDb = {
  medication?: string;
  level?: Relief["level"];
  minutesToRelief?: number | null;
  ratedAt?: { toMillis: () => number };
};

function reliefFromDb(r: ReliefFromDb | undefined): Relief | undefined {
  if (!r || !r.level) return undefined;
  return {
    medication: r.medication ?? "",
    level: r.level,
    minutesToRelief: r.minutesToRelief ?? null,
    ratedAtMs: r.ratedAt ? r.ratedAt.toMillis() : 0,
  };
}

export function useAttacks(max: number) {
  const uid = auth.currentUser?.uid;
  const cacheKey = uid ? `halo.cache.${max}.${uid}` : "";
  const [remote, setRemote] = useState<AttackItem[]>([]);
  const [pending, setPending] = useState<PendingAttack[]>([]);
  const [pendingRelief, setPendingRelief] = useState<PendingRelief[]>([]);
  const [online, setOnline] = useState(true);

  // 1. Show the last saved list straight away, even with no internet.
  useEffect(() => {
    if (!cacheKey) return;
    AsyncStorage.getItem(cacheKey)
      .then((raw) => {
        if (raw)
          setRemote((current) => (current.length ? current : JSON.parse(raw)));
      })
      .catch(() => {});
  }, [cacheKey]);

  // 2. Live updates from the cloud.
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "attacks"),
      orderBy("startedAt", "desc"),
      limit(max),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Offline and nothing cached by Firebase: keep showing the saved list.
        if (snapshot.metadata.fromCache && snapshot.empty) return;
        const items: AttackItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            severity: data.severity,
            startedAtMs: data.startedAt.toMillis(),
            symptoms: data.symptoms ?? [],
            note: data.note ?? "",
            relief: reliefFromDb(data.relief),
            pending: false,
          };
        });
        setRemote(items);
        if (!snapshot.metadata.fromCache) {
          AsyncStorage.setItem(cacheKey, JSON.stringify(items)).catch(() => {});
        }
      },
      (e) => console.warn("Could not load attacks", e),
    );
    return unsubscribe;
  }, [uid, max, cacheKey]);

  // 3. Logs and ratings waiting to upload, plus sync whenever the internet comes back.
  const loadPending = useCallback(() => {
    if (!uid) return;
    getPending(uid).then(setPending);
    getPendingRelief(uid).then(setPendingRelief);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    loadPending();
    const stopListening = onPendingChange(loadPending);
    syncPending(uid);
    const stopNet = NetInfo.addEventListener((state) => {
      const isOnline =
        !!state.isConnected && state.isInternetReachable !== false;
      setOnline(isOnline);
      if (isOnline) syncPending(uid);
    });
    return () => {
      stopListening();
      stopNet();
    };
  }, [uid, loadPending]);

  // Cloud logs + waiting logs, newest first, with waiting ratings applied.
  const items = useMemo(() => {
    const cloudIds = new Set(remote.map((r) => r.id));
    const waiting: AttackItem[] = pending
      .filter((p) => !cloudIds.has(p.id))
      .map((p) => ({
        id: p.id,
        severity: p.severity,
        startedAtMs: p.startedAtMs,
        symptoms: p.symptoms,
        note: p.note,
        relief: p.relief,
        pending: true,
      }));
    const ratings = new Map(pendingRelief.map((r) => [r.id, r.relief]));
    return [...waiting, ...remote]
      .map((a) =>
        ratings.has(a.id)
          ? { ...a, relief: ratings.get(a.id), pending: true }
          : a,
      )
      .sort((a, b) => b.startedAtMs - a.startedAtMs)
      .slice(0, max);
  }, [remote, pending, pendingRelief, max]);

  const waitingCount = items.filter((i) => i.pending).length;
  return { items, online, waitingCount };
}
