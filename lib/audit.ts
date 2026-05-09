import { createClient } from "@/lib/supabase/server";
import type { TipoAcaoAudit, ModuloAudit } from "@/types";

interface AuditParams {
  usuarioId: string;
  usuarioNome: string;
  tipoAcao: TipoAcaoAudit;
  modulo: ModuloAudit;
  descricao: string;
  valor?: number;
  dados?: Record<string, unknown>;
  ip?: string;
}

export async function registrarAuditoria(params: AuditParams) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    usuario_id: params.usuarioId,
    usuario_nome: params.usuarioNome,
    tipo_acao: params.tipoAcao,
    modulo: params.modulo,
    descricao: params.descricao,
    valor: params.valor ?? null,
    dados: params.dados ?? null,
    ip: params.ip ?? null,
  });
}
