"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, LockKeyhole, Package, ShieldCheck, ShoppingBag, TriangleAlert } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, formatNaira } from "@/lib/api";
import type { LucideIcon } from "lucide-react";

type StatCard = [LucideIcon, string, string | number];

export default function AdminPage() {
  const [email, setEmail] = useState("admin@zdcrown.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () => api.adminLogin(email, password),
    onSuccess: (data) => setToken(data.accessToken)
  });

  const stats = useQuery({
    queryKey: ["admin-stats", token],
    queryFn: () => api.adminStats(token ?? ""),
    enabled: Boolean(token)
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate();
  }

  if (!token) {
    return (
      <main className="grid min-h-dvh place-items-center bg-forest-950 px-4 py-12 text-white">
        <section className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 text-forest-950 shadow-soft">
          <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
            <LockKeyhole size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-black">Admin dashboard</h1>
          <p className="mt-2 leading-6 text-slate-600">Sign in with the secured admin account to manage products, inventory, and order requests.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm font-bold">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal"
              />
            </label>
            <label className="block text-sm font-bold">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 min-h-12 w-full rounded-md border border-slate-200 px-3 font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={login.isPending}
              className="min-h-12 w-full rounded-md bg-forest-600 font-black text-white transition hover:bg-forest-700 disabled:opacity-50"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
            {login.isError ? <p className="text-sm font-bold text-red-700">Invalid credentials or backend is unavailable.</p> : null}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-forest-600">ZD Crown</p>
            <h1 className="text-2xl font-black text-forest-950">Admin operations</h1>
          </div>
          <button
            type="button"
            onClick={() => setToken(null)}
            className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700"
          >
            Sign out
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <TriangleAlert className="mr-2 inline" size={18} aria-hidden="true" />
          Product CRUD screens are the next milestone. This foundation already protects admin stats through JWT.
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {([
            [Package, "Products", stats.data?.products ?? 0],
            [ShoppingBag, "Orders", stats.data?.orders ?? 0],
            [ShieldCheck, "Pending", stats.data?.pendingOrders ?? 0],
            [TriangleAlert, "Low stock", stats.data?.lowStock ?? 0],
            [BarChart3, "Revenue", formatNaira(stats.data?.revenue ?? 0)]
          ] satisfies StatCard[]).map(([Icon, label, value]) => (
            <article key={label as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-line">
              <Icon className="text-forest-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-sm font-bold text-slate-500">{label as string}</p>
              <p className="mt-1 text-3xl font-black text-forest-950">{value as string | number}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
