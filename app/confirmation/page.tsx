import { ConfirmationClient } from "@/components/confirmation-client";

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <ConfirmationClient orderId={params.order || ""} />
    </main>
  );
}
