"use client";

import { create } from "zustand";

/**
 * The one piece of genuinely client-only, cross-screen state the Learnix
 * design needs: a bottom-centre toast with an Undo action, triggered from
 * many different buttons (save, hide, remove) across many screens. Every
 * other piece of former client state (career, interests, weights, saved,
 * hidden, read, settings) now lives server-side per student — see
 * lib/data/repository.ts.
 */
export interface ToastState {
  label: string;
  undo?: () => void;
}

interface ToastStore {
  toast: ToastState | null;
  show: (label: string, undo?: () => void) => void;
  dismiss: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (label, undo) => {
    if (timer) clearTimeout(timer);
    set({ toast: { label, undo } });
    timer = setTimeout(() => set({ toast: null }), 6000);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ toast: null });
  },
}));
