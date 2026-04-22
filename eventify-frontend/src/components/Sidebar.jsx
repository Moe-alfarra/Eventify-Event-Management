import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDashboardRouteByRole } from "../routes/redirectByRole";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPath = getDashboardRouteByRole(role);
  const isActive = location.pathname === dashboardPath;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl md:flex">
      <div className="mb-10">
        <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-black/20">
          <div className="mr-3 h-3 w-3 rounded-full bg-violet-400" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Eventify
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          {role ? `${role.charAt(0)}${role.slice(1).toLowerCase()} workspace` : "Workspace"}
        </p>
      </div>

      <nav className="space-y-2">
        <Link
          to={dashboardPath}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            isActive
              ? "border border-violet-400/20 bg-violet-500/15 text-white shadow-lg shadow-violet-900/20"
              : "border border-transparent bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}