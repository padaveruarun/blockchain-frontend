import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

function portalRoute(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTITUTION":
      return "/institution";
    case "STUDENT":
      return "/student";
    default:
      return "/verify";
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await login(values.email, values.password);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const role = user?.role ?? "VERIFIER";
      navigate(portalRoute(role));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 animate-in fade-in duration-300">
      <Card className="w-full p-8 md:p-10 border-slate-150 shadow-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-navy-800 to-navy-500 shadow-md shadow-navy-500/10">
            <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">Welcome back</h1>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">Sign in to your CertiChain secure gateway</p>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-danger font-medium leading-relaxed">
            {error}
          </p>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              autoComplete="email" 
              className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" 
              placeholder="you@example.com" 
              {...form.register("email")} 
            />
            {form.formState.errors.email && (
              <p role="alert" className="mt-1 text-xs text-danger font-medium">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm"
              placeholder="••••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p role="alert" className="mt-1 text-xs text-danger font-medium">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full bg-navy-500 hover:bg-navy-700 shadow-md shadow-navy-500/10 h-11 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01]" disabled={form.formState.isSubmitting}>
            <Lock className="h-4 w-4 mr-1.5" aria-hidden="true" /> Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold">
            Forgot credentials?
          </Link>
        </div>
      </Card>

      <p className="mt-6 text-xs text-slate-500 font-medium">
        No platform account yet?{" "}
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
          Register here
        </Link>
      </p>

      <Card className="mt-8 w-full bg-slate-50/50 p-6 border-slate-100 shadow-xs">
        <p className="font-bold text-xs uppercase tracking-wider text-navy-900 mb-2">Sandbox Demonstration Accounts</p>
        <ul className="space-y-2 text-xs text-slate-500">
          <li className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-medium text-slate-700">Administrator</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">admin@certichain.demo</span></li>
          <li className="flex justify-between border-b border-slate-100 pb-1.5"><span className="font-medium text-slate-700">Institution</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">institution1@certichain.demo</span></li>
          <li className="flex justify-between"><span className="font-medium text-slate-700">Student Profile</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">studentsupport@certichain.demo</span></li>
        </ul>
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Global Passphrase</span>
          <span className="font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded">Password123!</span>
        </div>
      </Card>
    </div>
  );
}