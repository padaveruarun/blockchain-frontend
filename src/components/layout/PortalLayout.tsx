import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  History,
  UserRound,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Building2,
  ScanSearch,
  Boxes,
  FileBarChart2,
  ServerCog,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/institutions", label: "Institutions", icon: Building2 },
    { to: "/admin/users", label: "Users", icon: UserRound },
    { to: "/admin/certificates", label: "Certificates", icon: Award },
    { to: "/admin/verifications", label: "Verifications", icon: ScanSearch },
    { to: "/admin/blockchain", label: "Blockchain", icon: Boxes },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: FileBarChart2 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
  INSTITUTION: [
    { to: "/institution", label: "Dashboard", icon: LayoutDashboard },
    { to: "/institution/students", label: "Students", icon: GraduationCap },
    { to: "/institution/courses", label: "Courses", icon: BookOpen },
    { to: "/institution/certificates", label: "Certificates", icon: Award },
    { to: "/institution/certificates/issue", label: "Issue Certificate", icon: ServerCog },
    { to: "/institution/verification-history", label: "Verification History", icon: ScanSearch },
    { to: "/institution/profile", label: "Profile", icon: Settings },
  ],
  STUDENT: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/certificates", label: "Certificates", icon: Award },
    { to: "/student/history", label: "Verification History", icon: History },
    { to: "/student/profile", label: "Profile", icon: UserRound },
    { to: "/student/settings", label: "Settings", icon: Settings },
  ],
  VERIFIER: [
    { to: "/verify", label: "Verify Certificate", icon: ScanSearch },
  ],
};

function titleFor(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "Admin Portal";
    case "INSTITUTION":
      return "Institution Portal";
    case "STUDENT":
      return "Student Portal";
    default:
      return "Portal";
  }
}

export function PortalLayout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [window.location.pathname]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const nav = NAV[user.role] ?? NAV.VERIFIER;
  const base = user.role === "ADMIN" ? "/admin" : user.role === "INSTITUTION" ? "/institution" : user.role === "STUDENT" ? "/student" : "/";

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 lg:hidden">
        <Link to={base} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-navy-800 to-navy-500 shadow-md">
            <ShieldCheck className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent text-md">CertiChain</span>
        </Link>
        <button aria-label="Toggle sidebar" onClick={() => setOpen(!open)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-800 bg-slate-900 text-slate-400 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:flex-col lg:flex lg:h-screen lg:z-30",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Portal navigation"
        >
          <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-navy-500 to-indigo-500 shadow-lg shadow-navy-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">CertiChain</div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{titleFor(user.role)}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === base || item.to === "/user/verify"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-navy-500 text-white shadow-md shadow-navy-500/20 font-semibold" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-3 shrink-0 bg-slate-950/40">
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
              {user.full_name} · {user.role}
            </div>
            <div className="flex gap-2">
              <Link
                to="/verify"
                className="flex-1 rounded-xl border border-slate-700 bg-transparent px-3 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200"
              >
                Public Verify
              </Link>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                aria-label="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity" onClick={() => setOpen(false)} aria-hidden="true" />
        )}

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}