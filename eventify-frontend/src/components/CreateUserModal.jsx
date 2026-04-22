import { useState } from "react";
import { motion } from "framer-motion";

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ATTENDEE",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-white mb-6">
          Create User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-violet-400"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-violet-400"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-violet-400"
          />

          {/* Role Dropdown */}
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-white outline-none focus:border-violet-400"
            >
              <option value="ATTENDEE">Attendee</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}