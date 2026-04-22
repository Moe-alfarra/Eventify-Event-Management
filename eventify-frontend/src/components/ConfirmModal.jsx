import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}) {
  if (!isOpen) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500"
      : "bg-violet-600 hover:bg-violet-500";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}