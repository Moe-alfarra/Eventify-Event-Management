import { motion } from "framer-motion";

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              isActive
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="eventify-active-tab"
                className="absolute inset-0 -z-10 rounded-2xl border border-violet-400/20 bg-violet-500/15 shadow-lg shadow-violet-900/20"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}