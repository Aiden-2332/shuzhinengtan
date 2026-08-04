"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Set<() => void>();
let currentNow = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;

function publishNow() {
  currentNow = Date.now();
  subscribers.forEach((subscriber) => subscriber());
}

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    publishNow();
    timer = setInterval(publishNow, 30_000);
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  return currentNow;
}

function getServerSnapshot(): number | null {
  return null;
}

export function useRealtimeNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
