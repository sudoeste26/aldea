import { createClient } from "@/lib/supabase/server";
import { EmpreendimentosClient } from "./empreendimentos-client";

export const dynamic = "force-dynamic";

export default async function EmpreendimentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("empreendimentos")
    .select("*, unidades(count), tipos_unidade(count)")
    .order("criado_em", { ascending: false });
  return <EmpreendimentosClient inicial={data ?? []} />;
}
