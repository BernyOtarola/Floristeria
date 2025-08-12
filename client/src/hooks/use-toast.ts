"use client";

import * as React from "react";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

let store: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function toast(t: Omit<ToastItem, "id">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const item: ToastItem = { id, ...t };
  store = [...store, item];
  emit();

  const ms = t.duration ?? 3000;
  if (ms > 0) {
    setTimeout(() => dismiss(id), ms + 150); // margen para animación
  }
  return { id };
}

export function dismiss(id?: string) {
  store = id ? store.filter((x) => x.id !== id) : [];
  emit();
}

export function useToast() {
  const subscribe = React.useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);

  const getSnapshot = React.useCallback(() => store, []);
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { toasts, toast, dismiss };
}
