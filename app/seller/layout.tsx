import { AuthGate } from "@/components/auth-gate";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate
      title="Sign in to open Seller Studio"
      description="Seller listings, store settings and analytics are isolated to the signed-in Zomax account on this device."
    >
      {children}
    </AuthGate>
  );
}
