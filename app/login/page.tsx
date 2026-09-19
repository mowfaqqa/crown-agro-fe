"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

type Mode = "login" | "register";

export default function LoginPage() {
  return <Suspense fallback={<AuthLoading />}><AuthForm /></Suspense>;
}

function AuthLoading() {
  return <main><SiteHeader /><div className="mx-auto min-h-[60vh] max-w-md animate-pulse px-4 py-16"><div className="h-96 rounded-lg bg-forest-50" /></div></main>;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const requestedReturn = searchParams.get("returnTo") ?? "/marketplace";
  const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/marketplace";

  const authenticate = useMutation({
    mutationFn: () => mode === "register" ? api.registerCustomer(name, email, password) : api.loginCustomer(email, password),
    onSuccess: (session) => {
      setSession(session);
      router.replace(returnTo);
    }
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    authenticate.mutate();
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100dvh-104px)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-lg border border-forest-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
            {mode === "login" ? <LockKeyhole size={24} aria-hidden="true" /> : <UserRoundPlus size={24} aria-hidden="true" />}
          </div>
          <h1 className="mt-5 text-3xl font-black text-forest-950">{mode === "login" ? "Welcome back" : "Create your buyer account"}</h1>
          <p className="mt-2 leading-7 text-slate-600">Sign in is required to keep carts private and place an order.</p>

          <div className="mt-6 grid grid-cols-2 rounded-md bg-forest-50 p-1" aria-label="Account action">
            {(["login", "register"] as Mode[]).map((item) => (
              <button key={item} type="button" onClick={() => { setMode(item); authenticate.reset(); }} className={`min-h-11 rounded-md text-sm font-black capitalize ${mode === item ? "bg-white text-forest-950 shadow-line" : "text-slate-600"}`}>
                {item === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "register" ? (
              <label className="block text-sm font-bold text-forest-950">Full name
                <input required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" />
              </label>
            ) : null}
            <label className="block text-sm font-bold text-forest-950">Email
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" />
            </label>
            <label className="block text-sm font-bold text-forest-950">Password
              <span className="relative mt-1 block">
                <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-md border border-slate-200 px-3 pr-12 font-normal" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-slate-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </span>
            </label>
            {authenticate.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{authenticate.error instanceof ApiError ? authenticate.error.message : "Could not connect. Please try again."}</p> : null}
            <button type="submit" disabled={authenticate.isPending} className="min-h-12 w-full rounded-md bg-forest-600 px-5 font-black text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50">
              {authenticate.isPending ? "Please wait..." : mode === "login" ? "Sign in and continue" : "Create account and continue"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">You can still <Link href="/marketplace" className="font-black text-forest-700 underline">browse the marketplace</Link> without an account.</p>
        </div>
      </section>
    </main>
  );
}
