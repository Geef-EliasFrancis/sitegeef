import { Suspense } from "react";
import { DREReport } from "@/components/admin/financeiro/dre-report";

export const metadata = {
  title: "DRE - Admin GEEF",
};

export default async function DREPage({ searchParams }: { searchParams: Promise<{ mes?: string; ano?: string }> }) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="admin-loading-state">Carregando...</div>}>
      <DREReport searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
