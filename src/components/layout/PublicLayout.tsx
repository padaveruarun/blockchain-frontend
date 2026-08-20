import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FileCheck2, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/verify", label: "Verify" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="CertiChain home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-navy-800 to-navy-500 shadow-md shadow-navy-500/10 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
            CertiChain
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {publicLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-navy-500 relative py-1.5",
                  isActive && location.pathname === l.to && "text-navy-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-navy-500 after:rounded-full",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-600 mr-1">{user.full_name}</span>
              <Button 
                variant="secondary" 
                size="sm" 
                className="shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                onClick={() => (user.role === "ADMIN" ? (window.location.href = "/admin") : user.role === "INSTITUTION" ? (window.location.href = "/institution") : (window.location.href = "/student"))}
              >
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 transition-colors" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-50">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="primary" size="sm" className="bg-navy-500 hover:bg-navy-700 shadow-sm transition-all duration-200 hover:scale-[1.02]">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-50 md:hidden border border-transparent hover:border-slate-100 transition-all"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1.5">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all",
                    isActive && location.pathname === l.to && "bg-navy-50 text-navy-500 font-semibold"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Logged in as {user.full_name}
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full bg-navy-500" 
                    onClick={() => {
                      setOpen(false);
                      window.location.href = user.role === "ADMIN" ? "/admin" : user.role === "INSTITUTION" ? "/institution" : "/student";
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild variant="primary" className="w-full bg-navy-500">
                    <Link to="/register" onClick={() => setOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-500">
              <ShieldCheck className="h-4.5 w-4.5 text-white" aria-hidden="true" />
            </span>
            <span className="font-bold text-lg text-navy-900">CertiChain</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Blockchain-anchored verification for academic credentials. We help institutions secure digital trust, prevent fraud, and empower graduates globally.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-900">Verification Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            <li><Link className="hover:text-navy-500 transition-colors" to="/verify">Verify a Certificate</Link></li>
            <li><Link className="hover:text-navy-500 transition-colors" to="/how-it-works">How it Works</Link></li>
            <li><Link className="hover:text-navy-500 transition-colors" to="/about">About Technology</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-900">User Access</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            <li><Link className="hover:text-navy-500 transition-colors" to="/login">Institution Portal</Link></li>
            <li><Link className="hover:text-navy-500 transition-colors" to="/login">Student Dashboard</Link></li>
            <li><Link className="hover:text-navy-500 transition-colors" to="/register">Create Credential Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CertiChain Ledger Technology. Built with cryptographic anchors.
      </div>
    </footer>
  );
}