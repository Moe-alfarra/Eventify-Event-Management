import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Tag, Users, UserRound, Clock3, X } from "lucide-react";

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onRegister,
  isRegistering,
  isRegistered,
}) {
  if (!isOpen || !event) return null;

  const isFull = event.availableSeats <= 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {event.imageUrl ? (
            <div className="h-60 w-full overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-44 w-full bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700" />
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
                  {event.category}
                </span>

                <h2 className="mt-4 text-3xl font-bold text-white">{event.title}</h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {event.description}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={event.location}
              />
              <InfoRow
                icon={<UserRound className="h-4 w-4" />}
                label="Organizer"
                value={event.organizerName}
              />
              <InfoRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Start Time"
                value={formatDateTime(event.startTime)}
              />
              <InfoRow
                icon={<Clock3 className="h-4 w-4" />}
                label="End Time"
                value={formatDateTime(event.endTime)}
              />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Seats Left"
                value={`${event.availableSeats} / ${event.capacity}`}
              />
              <InfoRow
                icon={<Tag className="h-4 w-4" />}
                label="Status"
                value={event.status}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onRegister(event.eventId)}
                disabled={isRegistering || isFull || isRegistered}
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isRegistered
                    ? "bg-emerald-600"
                    : "bg-violet-600 hover:bg-violet-500"
                }`}
              >
                {isRegistered
                  ? "Registered"
                  : isRegistering
                  ? "Registering..."
                  : isFull
                  ? "Event Full"
                  : "Register for Event"}
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{value || "-"}</p>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}