import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { updateUsuarioSchema } from "@/lib/validators/usuario";
import { registrarAuditoria } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .is("deletado_em", null)
    .single();

  if (error || !data) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: me } = await supabase
    .from("usuarios")
    .select("nome, perfil")
    .eq("auth_id", user.id)
    .single();

  if (me?.perfil !== "Administrador") {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { data: updated, error } = await supabase
    .from("usuarios")
    .update(parsed.data)
    .eq("id", id)
    .is("deletado_em", null)
    .select()
    .single();

  if (error || !updated) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await registrarAuditoria({
    usuarioId: user.id,
    usuarioNome: me.nome,
    tipoAcao: "Edição",
    modulo: "Usuários",
    descricao: `Editou usuário ${updated.nome}`,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const serviceClient = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: me } = await supabase
    .from("usuarios")
    .select("nome, perfil")
    .eq("auth_id", user.id)
    .single();

  if (me?.perfil !== "Administrador") {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  // Busca o usuário para pegar o auth_id
  const { data: alvo } = await supabase
    .from("usuarios")
    .select("nome, auth_id")
    .eq("id", id)
    .single();

  if (!alvo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Soft delete na tabela pública
  await supabase
    .from("usuarios")
    .update({ deletado_em: new Date().toISOString(), ativo: false })
    .eq("id", id);

  // Desativa no Supabase Auth
  if (alvo.auth_id) {
    await serviceClient.auth.admin.updateUserById(alvo.auth_id, { ban_duration: "87600h" });
  }

  await registrarAuditoria({
    usuarioId: user.id,
    usuarioNome: me.nome,
    tipoAcao: "Remoção",
    modulo: "Usuários",
    descricao: `Removeu usuário ${alvo.nome}`,
  });

  return new NextResponse(null, { status: 204 });
}
