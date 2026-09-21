"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";

export default function ResetPasswordPage() { return <Suspense fallback={<ResetLoading />}><ResetForm /></Suspense>; }
function ResetLoading() { return <main><SiteHeader /><div className="mx-auto mt-12 h-96 max-w-md animate-pulse rounded-lg bg-forest-50" /></main>; }

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const reset = useMutation({ mutationFn: () => api.resetPassword(token, password) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === confirmPassword && token) reset.mutate();
  }

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-md place-items-center px-4 py-12"><div className="w-full rounded-lg border border-forest-100 bg-white p-6 shadow-soft sm:p-8">
    {reset.isSuccess ? <div className="text-center"><CheckCircle2 className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Password updated</h1><p className="mt-3 text-slate-600">Your previous sessions have been signed out. Use your new password to continue.</p><Link href="/login" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in</Link></div> : <><KeyRound className="text-forest-600" size={40} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Choose a new password</h1>{!token ? <div className="mt-4"><p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">This reset link is incomplete or expired.</p><Link href="/forgot-password" className="mt-4 inline-flex min-h-11 items-center font-black text-forest-700 underline">Request a new reset link</Link></div> : <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-forest-950">New password<span className="relative mt-1 block"><input required minLength={8} maxLength={72} type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-md border border-slate-200 px-3 pr-12 font-normal" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 grid size-10 place-items-center text-slate-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label className="block text-sm font-bold text-forest-950">Confirm password<input required minLength={8} maxLength={72} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" /></label>{mismatch ? <p role="alert" className="text-sm font-bold text-red-700">Passwords do not match.</p> : null}{reset.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{reset.error instanceof ApiError ? reset.error.message : "Could not reset the password."}</p> : null}<button disabled={reset.isPending || mismatch} className="min-h-12 w-full rounded-md bg-forest-600 px-5 font-black text-white disabled:opacity-50">{reset.isPending ? "Updating..." : "Update password"}</button></form>}</>}
  </div></section></main>;
}
