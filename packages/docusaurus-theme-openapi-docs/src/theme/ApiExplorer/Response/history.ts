/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { useSyncExternalStore } from "react";

export interface HistoryEntry {
  id: number;
  timestamp: number;
  status: "success" | "error";
  value?: string;
  code?: string;
  headers?: any;
  duration?: number;
  size?: number;
}

const MAX_ENTRIES = 5;
const EMPTY: HistoryEntry[] = [];

// Kept in memory only: responses can contain credentials or personal data.
const entries = new Map<string, HistoryEntry[]>();
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  listeners.forEach((listener) => listener());
}

export function historyKey(
  docId: string | undefined,
  method: string,
  path: string
) {
  return docId ?? `${method.toUpperCase()} ${path}`;
}

export function addHistoryEntry(
  key: string,
  entry: Omit<HistoryEntry, "id" | "timestamp">
): HistoryEntry {
  const full = { ...entry, id: nextId++, timestamp: Date.now() };
  entries.set(key, [full, ...(entries.get(key) ?? [])].slice(0, MAX_ENTRIES));
  emit();
  return full;
}

export function clearHistory(key: string) {
  entries.delete(key);
  emit();
}

export function getHistory(key: string): HistoryEntry[] {
  return entries.get(key) ?? EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useHistory(key: string): HistoryEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => getHistory(key),
    () => EMPTY
  );
}
