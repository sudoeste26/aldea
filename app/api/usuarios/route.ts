import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createUsuarioSchema } from "@/lib/validators/usuario";
import { registrarAuditoria } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 20));
  const search = searchParams.get("search") ?? "";
  const perfil = searchParams.get("perfil") ?? "";
  const ativo = searchParams.get("ativo");

  let query = supabase
    .from("usuarios")
    .select("*", { count: "exact" })
    .is("deletado_em", null)
    .order("criado_em", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (perfil) {
    query = query.eq("perfil", perfil);
  }
  if (ativo !== null && ativo !== "") {
    query = query.eq("ativo", ativo === "true");
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const serviceClient = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Verifica se é admin
  const { data: me } = await supabase
    .from("usuarios")
    .select("nome, perfil")
    .eq("auth_id", user.id)
    .single();

  if (me?.perfil !== "Administrador") {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { nome, email, perfil, senha } = parsed.data;

  // Cria o usuário no Supabase Auth
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Cria na tabela pública
  const { data: novoUsuario, error: dbError } = await supabase
    .from("usuarios")
    .insert({ auth_id: authData.user.id, nome, email, perfil })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await registrarAuditoria({
    usuarioId: user.id,
    usuarioNome: me.nome,
    tipoAcao: "Criação",
    modulo: "Usuários",
    descricao: `Criou usuário ${nome} (${perfil})`,
  });

  return NextResponse.json(novoUsuario, { status: 201 });
}
