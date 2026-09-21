"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MailCheck, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export default function VerifyEmailPage() { return <Suspense fallback={<VerifyLoading />}><VerifyEmailContent /></Suspense>; }
function VerifyLoading() { return <main><SiteHeader /><div className="mx-auto mt-12 h-80 max-w-md animate-pulse rounded-lg bg-forest-50" /></main>; }

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const sent = searchParams.get("sent") === "true";
  const started = useRef(false);
  const { customer, token, ready, refreshSession } = useAuth();
  const verify = useMutation({ mutationFn: () => api.verifyEmail(tokenFromUrl), onSuccess: () => refreshSession() });
  const resend = useMutation({ mutationFn: () => api.resendVerification(token ?? "") });

  useEffect(() => {
    if (tokenFromUrl && !started.current) {
      started.current = true;
      verify.mutate();
    }
  }, [tokenFromUrl, verify]);

  let content;
  if (verify.isPending) {
    content = <><RefreshCw className="mx-auto animate-spin text-forest-600" size={42} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Verifying your email</h1><p className="mt-3 text-slate-600">This will only take a moment.</p></>;
  } else if (verify.isSuccess || customer?.emailVerified) {
    content = <><CheckCircle2 className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Email verified</h1><p className="mt-3 text-slate-600">Your buyer account is ready for checkout.</p><Link href="/account" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Open your account</Link></>;
  } else if (verify.isError) {
    content = <><TriangleAlert className="mx-auto text-red-700" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Verification link unavailable</h1><p role="alert" className="mt-3 text-slate-600">{verify.error instanceof ApiError ? verify.error.message : "Request a new verification email."}</p>{customer && token ? <button type="button" onClick={() => resend.mutate()} disabled={resend.isPending} className="mt-6 min-h-12 rounded-md bg-forest-600 px-6 font-black text-white disabled:opacity-50">{resend.isPending ? "Sending..." : "Send a new link"}</button> : <Link href="/login" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-forest-600 px-6 font-black text-white">Sign in</Link>}</>;
  } else {
    content = <><MailCheck className="mx-auto text-forest-600" size={44} aria-hidden="true" /><h1 className="mt-4 text-3xl font-black text-forest-950">Check your inbox</h1><p className="mt-3 leading-7 text-slate-600">{sent ? "We sent a verification link to your email address." : "Open the verification link sent to your email."} The link expires after 24 hours.</p>{ready && customer && token ? <button type="button" onClick={() => resend.mutate()} disabled={resend.isPending || resend.isSuccess} className="mt-6 min-h-12 rounded-md border border-forest-200 px-6 font-black text-forest-800 disabled:opacity-50">{resend.isSuccess ? "Email sent" : resend.isPending ? "Sending..." : "Resend verification email"}</button> : null}{resend.isError ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">Could not resend the email. Please try again.</p> : null}</>;
  }

  return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-lg place-items-center px-4 py-12"><div className="w-full rounded-lg border border-forest-100 bg-white p-8 text-center shadow-soft">{content}</div></section></main>;
}
