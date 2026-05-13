import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateInvestidorSchema } from "@/lib/validators/investidor";
import { registrarAuditoria } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investidores")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const parsed = updateInvestidorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("investidores")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  await registrarAuditoria({
    usuarioId: user?.id ?? "",
    usuarioNome: user?.email ?? "Sistema",
    tipoAcao: "Edição",
    modulo: "Investidores",
    descricao: `Editou investidor ${data.nome}`,
  });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: alvo } = await supabase.from("investidores").select("nome").eq("id", id).single();
  const { error } = await supabase.from("investidores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  await registrarAuditoria({
    usuarioId: user?.id ?? "",
    usuarioNome: user?.email ?? "Sistema",
    tipoAcao: "Remoção",
    modulo: "Investidores",
    descricao: `Removeu investidor ${alvo?.nome ?? id}`,
  });
  return NextResponse.json({ ok: true });
}
