import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />

      <p className="text-sm font-medium text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</h3>

      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </motion.div>
  );
}