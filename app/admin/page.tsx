"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, BarChart3, Edit3, LockKeyhole, Newspaper, Package, Plus, RotateCcw, Save, ShieldCheck, ShoppingBag, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ApiError, api, formatNaira, type AdminMarketInsightFormPayload, type AdminProductFormPayload } from "@/lib/api";
import type { AdminProduct, MarketInsight, MarketInsightType, OrderStatus } from "@/lib/types";

type StatCard = [LucideIcon, string, string | number];
type AdminTab = "overview" | "products" | "intelligence" | "orders";

const emptyProduct: AdminProductFormPayload = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  category: "FRUITS",
  countryOfOrigin: "Nigeria",
  stockQuantity: 0,
  unit: "Bag",
  imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
  halalCertified: true,
  exportCertified: false,
  featured: false,
  sellerName: "ZD Crown Orchards",
  sellerCountry: "Nigeria",
  bulkPricing: [{ minQuantity: 10, unitPrice: 0 }]
};

const allowedNextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["FULFILLED"],
  FULFILLED: [],
  CANCELLED: []
};
const categories: AdminProduct["category"][] = ["FRUITS", "GRAINS", "VEGETABLES", "LIVESTOCK", "POULTRY", "FISH", "EQUIPMENT", "PROCESSED_FOODS"];
const insightTypes: { value: MarketInsightType; label: string }[] = [
  { value: "COMMODITY_PRICE", label: "Commodity price" },
  { value: "AGRICULTURE_NEWS", label: "Agriculture news" },
  { value: "EXPORT_OPPORTUNITY", label: "Export opportunity" },
  { value: "WEATHER_ADVISORY", label: "Weather advisory" }
];
const emptyInsight: AdminMarketInsightFormPayload = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  type: "AGRICULTURE_NEWS",
  imageUrl: "",
  location: "Nigeria",
  commodity: "",
  dataValue: "",
  sourceName: "ZD Crown editorial team",
  sourceUrl: "",
  featured: false,
  published: false
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("admin@zdcrown.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<AdminProductFormPayload>(emptyProduct);
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [insightForm, setInsightForm] = useState<AdminMarketInsightFormPayload>(emptyInsight);

  const login = useMutation({
    mutationFn: () => api.adminLogin(email, password),
    onSuccess: (data) => setToken(data.accessToken)
  });
  const stats = useQuery({ queryKey: ["admin-stats", token], queryFn: () => api.adminStats(token ?? ""), enabled: Boolean(token) });
  const products = useQuery({ queryKey: ["admin-products", token], queryFn: () => api.adminProducts(token ?? ""), enabled: Boolean(token) });
  const orders = useQuery({ queryKey: ["admin-orders", token], queryFn: () => api.adminOrders(token ?? ""), enabled: Boolean(token) });
  const intelligence = useQuery({ queryKey: ["admin-market-intelligence", token], queryFn: () => api.adminMarketIntelligence(token ?? ""), enabled: Boolean(token) });

  const saveProduct = useMutation({
    mutationFn: () => (editingId ? api.updateAdminProduct(token ?? "", editingId, productForm) : api.createAdminProduct(token ?? "", productForm)),
    onSuccess: async () => {
      setEditingId(null);
      setProductForm(emptyProduct);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-products", token] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats", token] })
      ]);
    }
  });
  const archiveProduct = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? api.unarchiveAdminProduct(token ?? "", id) : api.archiveAdminProduct(token ?? "", id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-products", token] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats", token] })
      ]);
    }
  });
  const updateNotes = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => api.updateOrderNotes(token ?? "", id, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-orders", token] });
    }
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.updateOrderStatus(token ?? "", id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders", token] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats", token] })
      ]);
    }
  });
  const saveInsight = useMutation({
    mutationFn: () => editingInsightId ? api.updateAdminMarketInsight(token ?? "", editingInsightId, insightForm) : api.createAdminMarketInsight(token ?? "", insightForm),
    onSuccess: async () => {
      setEditingInsightId(null);
      setInsightForm(emptyInsight);
      await queryClient.invalidateQueries({ queryKey: ["admin-market-intelligence", token] });
    }
  });
  const archiveInsight = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => api.setAdminMarketInsightArchived(token ?? "", id, archived),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["admin-market-intelligence", token] })
  });

  const lowStock = useMemo(() => products.data?.filter((product) => !product.archivedAt && product.stockQuantity <= 20) ?? [], [products.data]);

  function editProduct(product: AdminProduct) {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: product.category,
      countryOfOrigin: product.countryOfOrigin,
      stockQuantity: product.stockQuantity,
      unit: product.unit,
      imageUrl: product.imageUrl,
      halalCertified: product.halalCertified,
      exportCertified: product.exportCertified,
      featured: product.featured,
      sellerName: product.sellerName,
      sellerCountry: product.sellerCountry,
      bulkPricing: product.bulkPricing.length ? product.bulkPricing : [{ minQuantity: 10, unitPrice: product.price }]
    });
    setTab("products");
  }

  function editInsight(insight: MarketInsight) {
    setEditingInsightId(insight.id);
    setInsightForm({
      title: insight.title,
      slug: insight.slug,
      summary: insight.summary,
      content: insight.content,
      type: insight.type,
      imageUrl: insight.imageUrl ?? "",
      location: insight.location ?? "",
      commodity: insight.commodity ?? "",
      dataValue: insight.dataValue ?? "",
      sourceName: insight.sourceName ?? "",
      sourceUrl: insight.sourceUrl ?? "",
      featured: insight.featured,
      published: Boolean(insight.publishedAt)
    });
    setTab("intelligence");
  }

  if (!token) {
    return (
      <main className="grid min-h-dvh place-items-center bg-forest-950 px-4 py-12 text-white">
        <section className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 text-forest-950 shadow-soft">
          <div className="grid size-12 place-items-center rounded-md bg-forest-600 text-white">
            <LockKeyhole size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-black">Admin dashboard</h1>
          <p className="mt-2 leading-6 text-slate-600">Sign in to manage products, orders, and published content.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              login.mutate();
            }}
          >
            <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <TextField label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
            <button type="submit" disabled={login.isPending} className="min-h-12 w-full rounded-md bg-forest-600 font-black text-white transition hover:bg-forest-700 disabled:opacity-50">
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-forest-600">ZD Crown</p>
            <h1 className="text-2xl font-black text-forest-950">Admin operations</h1>
          </div>
          <button type="button" onClick={() => setToken(null)} className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700">
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {(["overview", "products", "intelligence", "orders"] as AdminTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`min-h-11 rounded-md px-4 text-sm font-black capitalize ${tab === item ? "bg-forest-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {([
                [Package, "Products", stats.data?.products ?? 0],
                [ShoppingBag, "Orders", stats.data?.orders ?? 0],
                [ShieldCheck, "Pending", stats.data?.pendingOrders ?? 0],
                [TriangleAlert, "Low stock", stats.data?.lowStock ?? 0],
                [BarChart3, "Revenue", formatNaira(stats.data?.revenue ?? 0)]
              ] satisfies StatCard[]).map(([Icon, label, value]) => (
                <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-line">
                  <Icon className="text-forest-600" size={24} aria-hidden="true" />
                  <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-black text-forest-950">{value}</p>
                </article>
              ))}
            </div>
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black text-forest-950">Low-stock watchlist</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {lowStock.length ? (
                  lowStock.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-bold text-forest-950">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.sellerName}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
                        {product.stockQuantity} {product.unit}s
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-slate-600">No low-stock products yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "products" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
            <ProductForm
              form={productForm}
              editingId={editingId}
              pending={saveProduct.isPending}
              onChange={setProductForm}
              onSubmit={(event) => {
                event.preventDefault();
                saveProduct.mutate();
              }}
              onCancel={() => {
                setEditingId(null);
                setProductForm(emptyProduct);
              }}
            />
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-black text-forest-950">Product catalog</h2>
                <p className="mt-1 text-sm text-slate-600">Edit inventory, certification flags, sellers, and pricing.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {(products.data ?? []).map((product) => (
                  <article key={product.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-forest-950">{product.name}</h3>
                        {product.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs font-black text-forest-950">Featured</span> : null}
                        {product.archivedAt ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">Archived</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {product.sellerName} | {product.countryOfOrigin} | {product.category.replace("_", " ")}
                      </p>
                      <p className="mt-2 font-black text-forest-950">
                        {formatNaira(product.price)} · {product.stockQuantity} {product.unit}s in stock
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editProduct(product)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold">
                        <Edit3 size={16} aria-hidden="true" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => archiveProduct.mutate({ id: product.id, archived: Boolean(product.archivedAt) })}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm font-bold text-slate-700"
                      >
                        {product.archivedAt ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                        {product.archivedAt ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  </article>
                ))}
                {!products.data?.length ? <p className="p-5 text-slate-600">No products yet.</p> : null}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "intelligence" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
            <MarketInsightForm
              form={insightForm}
              editingId={editingInsightId}
              pending={saveInsight.isPending}
              error={saveInsight.isError ? (saveInsight.error instanceof ApiError ? saveInsight.error.message : "Could not save this update.") : undefined}
              onChange={setInsightForm}
              onSubmit={(event) => { event.preventDefault(); saveInsight.mutate(); }}
              onCancel={() => { setEditingInsightId(null); setInsightForm(emptyInsight); }}
            />
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-forest-950">Intelligence library</h2><p className="mt-1 text-sm text-slate-600">Manage drafts, sources, featured updates, and archived entries.</p></div>
              <div className="divide-y divide-slate-100">
                {(intelligence.data ?? []).map((insight) => <article key={insight.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-forest-950">{insight.title}</h3><span className={`rounded-full px-2 py-1 text-xs font-black ${insight.archivedAt ? "bg-slate-100 text-slate-700" : insight.publishedAt ? "bg-forest-50 text-forest-800" : "bg-amber-100 text-amber-900"}`}>{insight.archivedAt ? "Archived" : insight.publishedAt ? "Published" : "Draft"}</span>{insight.featured ? <span className="rounded-full bg-harvest-100 px-2 py-1 text-xs font-black text-forest-950">Featured</span> : null}</div><p className="mt-1 text-sm font-bold text-forest-600">{insightTypes.find((item) => item.value === insight.type)?.label}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{insight.summary}</p></div><div className="flex gap-2"><button type="button" onClick={() => editInsight(insight)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold"><Edit3 size={16} aria-hidden="true" /> Edit</button><button type="button" onClick={() => archiveInsight.mutate({ id: insight.id, archived: !insight.archivedAt })} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm font-bold text-slate-700">{insight.archivedAt ? <RotateCcw size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}{insight.archivedAt ? "Restore" : "Archive"}</button></div></article>)}
                {intelligence.isLoading ? <p className="p-5 text-slate-600">Loading intelligence...</p> : null}
                {intelligence.isError ? <p className="p-5 font-bold text-red-700">Could not load market intelligence.</p> : null}
                {!intelligence.isLoading && !intelligence.data?.length ? <p className="p-5 text-slate-600">No intelligence entries yet. Create the first draft.</p> : null}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "orders" ? (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black text-forest-950">Order requests</h2>
              <p className="mt-1 text-sm text-slate-600">Process registered buyer orders through controlled fulfillment stages.</p>
              {updateStatus.isError ? <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{updateStatus.error instanceof ApiError ? updateStatus.error.message : "Could not update the order status."}</p> : null}
            </div>
            <div className="divide-y divide-slate-100">
              {(orders.data ?? []).map((order) => (
                <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_280px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-black text-forest-950">{order.orderNumber}</h3>
                      <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-black text-forest-800">{order.status.replace("_", " ")}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {order.customerName} | {order.email} | {order.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.deliveryCountry}: {order.deliveryAddress}
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      {order.items.map((item) => (
                        <p key={item.id}>
                          {item.quantity} x {item.product.name} ({formatNaira(item.unitPrice)} / {item.product.unit})
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 text-lg font-black text-forest-950">{formatNaira(order.subtotal)}</p>
                    <div className="mt-4 rounded-md bg-slate-50 p-4">
                      <p className="text-sm font-black text-forest-950">Payment readiness</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Provider: {order.paymentProvider ?? "Not initialized"} | Reference: {order.paymentReference ?? "None"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-forest-950">
                      Status
                      <select disabled={!allowedNextStatuses[order.status].length || updateStatus.isPending} value={order.status} onChange={(event) => updateStatus.mutate({ id: order.id, status: event.target.value as OrderStatus })} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 disabled:bg-slate-100">
                        {[order.status, ...allowedNextStatuses[order.status]].map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-bold text-forest-950">
                      Fulfillment notes
                      <textarea
                        value={orderNotes[order.id] ?? order.fulfillmentNotes ?? ""}
                        onChange={(event) => setOrderNotes((current) => ({ ...current, [order.id]: event.target.value }))}
                        className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal"
                        placeholder="Inspection, delivery, buyer follow-up..."
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateNotes.mutate({ id: order.id, notes: orderNotes[order.id] ?? order.fulfillmentNotes ?? "" })}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest-600 px-4 text-sm font-black text-white disabled:opacity-50"
                      disabled={updateNotes.isPending}
                    >
                      <Save size={16} aria-hidden="true" /> Save notes
                    </button>
                  </div>
                </article>
              ))}
              {!orders.data?.length ? <p className="p-5 text-slate-600">No orders yet.</p> : null}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function ProductForm({
  form,
  editingId,
  pending,
  onChange,
  onSubmit,
  onCancel
}: {
  form: AdminProductFormPayload;
  editingId: string | null;
  pending: boolean;
  onChange: (value: AdminProductFormPayload) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  function setField<K extends keyof AdminProductFormPayload>(key: K, value: AdminProductFormPayload[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-md bg-forest-600 text-white">
          <Plus size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-forest-950">{editingId ? "Edit product" : "Add product"}</h2>
          <p className="text-sm text-slate-600">Keep product data export-ready.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <TextField label="Name" value={form.name} onChange={(value) => setField("name", value)} />
        <TextField label="Slug" value={form.slug} onChange={(value) => setField("slug", value)} />
        <TextField label="Description" value={form.description} onChange={(value) => setField("description", value)} />
        <TextField label="Country of origin" value={form.countryOfOrigin} onChange={(value) => setField("countryOfOrigin", value)} />
        <TextField label="Unit" value={form.unit} onChange={(value) => setField("unit", value)} />
        <TextField label="Seller name" value={form.sellerName} onChange={(value) => setField("sellerName", value)} />
        <TextField label="Seller country" value={form.sellerCountry} onChange={(value) => setField("sellerCountry", value)} />
        <TextField label="Image URL" type="url" value={form.imageUrl} onChange={(value) => setField("imageUrl", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Price" value={form.price} onChange={(value) => setField("price", value)} />
          <NumberField label="Compare at price" value={form.compareAtPrice ?? 0} onChange={(value) => setField("compareAtPrice", value || undefined)} />
          <NumberField label="Stock quantity" value={form.stockQuantity} onChange={(value) => setField("stockQuantity", value)} />
          <NumberField
            label="Bulk min quantity"
            value={form.bulkPricing[0]?.minQuantity ?? 1}
            onChange={(value) => setField("bulkPricing", [{ minQuantity: value, unitPrice: form.bulkPricing[0]?.unitPrice ?? form.price }])}
          />
          <NumberField
            label="Bulk unit price"
            value={form.bulkPricing[0]?.unitPrice ?? 0}
            onChange={(value) => setField("bulkPricing", [{ minQuantity: form.bulkPricing[0]?.minQuantity ?? 1, unitPrice: value }])}
          />
          <label className="block text-sm font-bold text-forest-950">
            Category
            <select value={form.category} onChange={(event) => setField("category", event.target.value as AdminProduct["category"])} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <CheckField label="Halal certified" checked={form.halalCertified} onChange={(value) => setField("halalCertified", value)} />
          <CheckField label="Export certified" checked={form.exportCertified} onChange={(value) => setField("exportCertified", value)} />
          <CheckField label="Featured" checked={form.featured} onChange={(value) => setField("featured", value)} />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50">
          <Save size={17} aria-hidden="true" /> {pending ? "Saving..." : "Save product"}
        </button>
        {editingId ? (
          <button type="button" onClick={onCancel} className="min-h-11 rounded-md border border-slate-200 px-4 font-bold">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function MarketInsightForm({ form, editingId, pending, error, onChange, onSubmit, onCancel }: {
  form: AdminMarketInsightFormPayload;
  editingId: string | null;
  pending: boolean;
  error?: string;
  onChange: (value: AdminMarketInsightFormPayload) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  function setField<K extends keyof AdminMarketInsightFormPayload>(key: K, value: AdminMarketInsightFormPayload[K]) {
    onChange({ ...form, [key]: value });
  }

  return <form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
    <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-md bg-forest-600 text-white"><Newspaper size={20} aria-hidden="true" /></div><div><h2 className="text-xl font-black text-forest-950">{editingId ? "Edit intelligence" : "New intelligence"}</h2><p className="text-sm text-slate-600">Publish only verified, current information.</p></div></div>
    <div className="mt-5 grid gap-4">
      <label className="block text-sm font-bold text-forest-950">Type<select value={form.type} onChange={(event) => setField("type", event.target.value as MarketInsightType)} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3">{insightTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
      <TextField label="Title" value={form.title} onChange={(value) => setField("title", value)} />
      <TextField label="Slug" value={form.slug} onChange={(value) => setField("slug", value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} />
      <label className="block text-sm font-bold text-forest-950">Summary<textarea required minLength={20} maxLength={360} value={form.summary} onChange={(event) => setField("summary", event.target.value)} className="mt-1 min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /></label>
      <label className="block text-sm font-bold text-forest-950">Full update<textarea required minLength={40} maxLength={12000} value={form.content} onChange={(event) => setField("content", event.target.value)} className="mt-1 min-h-48 w-full rounded-md border border-slate-200 px-3 py-2 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Separate paragraphs with a blank line.</span></label>
      <TextField label="Image URL" type="url" required={false} value={form.imageUrl ?? ""} onChange={(value) => setField("imageUrl", value)} />
      <div className="grid gap-4 sm:grid-cols-2"><TextField label="Location" required={false} value={form.location ?? ""} onChange={(value) => setField("location", value)} /><TextField label="Commodity" required={false} value={form.commodity ?? ""} onChange={(value) => setField("commodity", value)} /><TextField label="Key value or headline" required={false} value={form.dataValue ?? ""} onChange={(value) => setField("dataValue", value)} /><TextField label="Source name" required={false} value={form.sourceName ?? ""} onChange={(value) => setField("sourceName", value)} /></div>
      <TextField label="Source URL" type="url" required={false} value={form.sourceUrl ?? ""} onChange={(value) => setField("sourceUrl", value)} />
      <div className="grid gap-3 sm:grid-cols-2"><CheckField label="Featured" checked={form.featured} onChange={(value) => setField("featured", value)} /><CheckField label="Published" checked={form.published} onChange={(value) => setField("published", value)} /></div>
      {error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    </div>
    <div className="mt-5 flex gap-2"><button type="submit" disabled={pending} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-forest-600 px-4 font-black text-white disabled:opacity-50"><Save size={17} aria-hidden="true" />{pending ? "Saving..." : form.published ? "Save and publish" : "Save draft"}</button>{editingId ? <button type="button" onClick={onCancel} className="min-h-11 rounded-md border border-slate-200 px-4 font-bold">Cancel</button> : null}</div>
  </form>;
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-forest-950">
      {label}
      <input
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-bold text-forest-950">
      {label}
      <input required type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 font-normal" />
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-bold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
