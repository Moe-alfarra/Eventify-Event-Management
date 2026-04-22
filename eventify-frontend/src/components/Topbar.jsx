import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, role } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/50 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-violet-300/80">
            {role} Dashboard
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-right shadow-lg shadow-black/10">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}