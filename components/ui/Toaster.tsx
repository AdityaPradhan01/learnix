"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useToastStore } from "@/lib/store/useToastStore";

/** Bottom-centre ink pill with a salt "Undo" pill. Auto-dismisses after 6s
 *  (see useToastStore) — this component only renders whatever is current. */
export function Toaster() {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="pill pointer-events-auto flex items-center gap-3 bg-ink py-2.5 pl-5 pr-2.5 text-salt shadow-hero"
          >
            <span className="text-[13.5px]">{toast.label}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  dismiss();
                }}
                className="pill bg-salt px-4 py-1.5 text-[12.5px] font-semibold text-ink"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
