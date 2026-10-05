import { PaymentCallback } from "./payment-callback";

export default function PaystackCallbackPage({ searchParams }: {
  searchParams: { orderId?: string; reference?: string; trxref?: string };
}) {
  return <PaymentCallback orderId={searchParams.orderId ?? ""} reference={searchParams.reference ?? searchParams.trxref ?? ""} />;
}
