"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const requestReset = useMutation({ mutationFn: () => api.forgotPassword(email) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    requestReset.mutate();
  }

  return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-md place-items-center px-4 py-12"><div className="w-full rounded-lg border border-forest-100 bg-white p-6 shadow-soft sm:p-8">
    {requestReset.isSuccess ? <div className="text-center"><CheckCircle2 className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Check your email</h1><p className="mt-3 leading-7 text-slate-600">If an account exists for that address, we sent a password reset link. It expires in one hour.</p><Link href="/login" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Back to sign in</Link></div> : <><KeyRound className="text-forest-600" size={40} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Reset your password</h1><p className="mt-2 leading-7 text-slate-600">Enter the email used for your buyer account.</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-forest-950">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal" /></label>{requestReset.isError ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{requestReset.error instanceof ApiError ? requestReset.error.message : "Could not request a reset link."}</p> : null}<button disabled={requestReset.isPending} className="min-h-12 w-full rounded-md bg-forest-600 px-5 font-black text-white disabled:opacity-50">{requestReset.isPending ? "Sending..." : "Send reset link"}</button></form><p className="mt-5 text-center text-sm"><Link href="/login" className="font-black text-forest-700 underline">Return to sign in</Link></p></>}
  </div></section></main>;
}
