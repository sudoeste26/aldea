import { createClient } from "@/lib/supabase/server";
import { InvestidoresClient } from "./investidores-client";

export const dynamic = "force-dynamic";

export default async function InvestidoresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investidores")
    .select("*, unidades(count)")
    .order("criado_em", { ascending: false });

  return <InvestidoresClient inicial={data ?? []} />;
}
