import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { getDashboardRouteByRole } from "../../routes/redirectByRole";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, role, authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardRouteByRole(role)} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoToRegister = () => {
    logout();
    navigate("/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const data = await loginUser(formData);

      login(data);

      toast.success("Welcome back!");

      setTimeout(() => {
        navigate(getDashboardRouteByRole(data.role), { replace: true });
      }, 800);

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:grid-cols-2"
        >
          <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-700 via-fuchsia-600 to-indigo-700 p-10 md:flex">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium">
                Eventify
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Manage, discover, and organize events in one place.
              </h1>

              <p className="mt-4 max-w-md text-sm text-white/80">
                Sign in to access your personalized dashboard, manage events, track registrations,
                and keep everything streamlined.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/85">
                Eventify gives attendees, organizers, and admins a clean workflow for event
                discovery, registration, and management.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-8 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
                  Welcome back
                </div>
                <h2 className="mt-2 text-3xl font-bold">Sign in to Eventify</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Enter your email and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={handleGoToRegister}
                  className="font-medium text-violet-300 hover:text-violet-200"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}