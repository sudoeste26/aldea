import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateEmpreendimentoSchema } from "@/lib/validators/empreendimento";
import { registrarAuditoria } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("empreendimentos").select("*, parametros_qualitativos(*), tipos_unidade(*)").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const parsed = updateEmpreendimentoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { data, error } = await supabase.from("empreendimentos").update(parsed.data).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  await registrarAuditoria({ usuarioId: user?.id ?? "", usuarioNome: user?.email ?? "Sistema", tipoAcao: "Edição", modulo: "Empreendimentos", descricao: `Editou empreendimento ${data.nome}` });
  return NextResponse.json({ data });
}

export async function DELETE(_r: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: alvo } = await supabase.from("empreendimentos").select("nome").eq("id", id).single();
  const { error } = await supabase.from("empreendimentos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  await registrarAuditoria({ usuarioId: user?.id ?? "", usuarioNome: user?.email ?? "Sistema", tipoAcao: "Remoção", modulo: "Empreendimentos", descricao: `Removeu empreendimento ${alvo?.nome ?? id}` });
  return NextResponse.json({ ok: true });
}
