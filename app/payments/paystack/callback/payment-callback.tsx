"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export function PaymentCallback({ orderId, reference }: { orderId: string; reference: string }) {
  const { token, ready } = useAuth();
  const queryClient = useQueryClient();
  const started = useRef(false);
  const verify = useMutation({
    mutationFn: () => api.verifyOrderPayment(token ?? "", orderId, reference),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customer-orders"] })
  });

  useEffect(() => {
    if (ready && token && orderId && reference && !started.current) {
      started.current = true;
      verify.mutate();
    }
  }, [orderId, ready, reference, token, verify]);

  const returnTo = `/payments/paystack/callback?orderId=${encodeURIComponent(orderId)}&reference=${encodeURIComponent(reference)}`;
  let content;
  if (!orderId || !reference) {
    content = <Status icon={CircleAlert} title="Payment reference missing" copy="Return to your account and reopen payment for this order." error />;
  } else if (!ready) {
    content = <Status icon={LoaderCircle} title="Checking your session" copy="Please wait a moment." spinning />;
  } else if (!token) {
    content = <Status icon={CircleAlert} title="Sign in to verify payment" copy="Use the same customer account that placed this order." action={<Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">Sign in</Link>} />;
  } else if (verify.isSuccess) {
    content = <Status icon={CheckCircle2} title="Payment confirmed" copy={`Your order ${verify.data.orderNumber} is paid and ready for fulfilment.`} action={<Link href="/account" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest-600 px-5 font-black text-white">View order</Link>} />;
  } else if (verify.isError) {
    content = <Status icon={CircleAlert} title="Payment not confirmed" copy={verify.error instanceof ApiError ? verify.error.message : "We could not verify this payment. No order status was changed."} error action={<Link href="/account" className="mt-6 inline-flex min-h-11 items-center rounded-md border border-slate-200 px-5 font-black text-forest-950">Return to account</Link>} />;
  } else {
    content = <Status icon={LoaderCircle} title="Verifying payment" copy="We are securely confirming the transaction with Paystack." spinning />;
  }

  return <main><SiteHeader /><section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16">{content}</section></main>;
}

function Status({ icon: Icon, title, copy, error = false, spinning = false, action }: {
  icon: typeof CheckCircle2;
  title: string;
  copy: string;
  error?: boolean;
  spinning?: boolean;
  action?: React.ReactNode;
}) {
  return <div className="w-full rounded-lg border border-forest-100 bg-white p-8 text-center shadow-line sm:p-12"><Icon className={`mx-auto ${error ? "text-red-600" : "text-forest-600"} ${spinning ? "animate-spin" : ""}`} size={44} aria-hidden="true" /><h1 className="mt-5 text-3xl font-black text-forest-950">{title}</h1><p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">{copy}</p>{action}</div>;
}
