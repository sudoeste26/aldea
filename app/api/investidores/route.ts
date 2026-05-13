import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvestidorSchema } from "@/lib/validators/investidor";
import { registrarAuditoria } from "@/lib/audit";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investidores")
    .select("*, unidades(count)")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const parsed = createInvestidorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("investidores")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  await registrarAuditoria({
    usuarioId: user?.id ?? "",
    usuarioNome: user?.email ?? "Sistema",
    tipoAcao: "Criação",
    modulo: "Investidores",
    descricao: `Criou investidor ${data.nome}`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
