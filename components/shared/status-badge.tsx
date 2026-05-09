import { Badge } from "@/components/ui/badge";
import type { StatusProposta, StatusUnidade, PerfilUsuario } from "@/types";

export function PropostaBadge({ status }: { status: StatusProposta }) {
  const map: Record<StatusProposta, { variant: "success" | "info" | "purple" | "destructive" | "warning" | "outline"; label: string }> = {
    Rascunho: { variant: "warning", label: "Rascunho" },
    Enviada: { variant: "info", label: "Enviada" },
    Visualizada: { variant: "purple", label: "Visualizada" },
    Aceita: { variant: "success", label: "Aceita" },
    Rejeitada: { variant: "destructive", label: "Rejeitada" },
    Expirada: { variant: "outline", label: "Expirada" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function UnidadeBadge({ status }: { status: StatusUnidade }) {
  const map: Record<StatusUnidade, { variant: "warning" | "success" | "info" | "outline"; label: string }> = {
    "Em construção": { variant: "warning", label: "Em construção" },
    Disponível: { variant: "success", label: "Disponível" },
    Locada: { variant: "info", label: "Locada" },
    Vendida: { variant: "outline", label: "Vendida" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PerfilBadge({ perfil }: { perfil: PerfilUsuario }) {
  const map: Record<PerfilUsuario, { variant: "default" | "info" | "outline"; label: string }> = {
    Administrador: { variant: "default", label: "Administrador" },
    "Gestor Comercial": { variant: "info", label: "Gestor Comercial" },
    Investidor: { variant: "outline", label: "Investidor" },
  };
  const { variant, label } = map[perfil];
  return <Badge variant={variant}>{label}</Badge>;
}

export function Ativobadge({ ativo }: { ativo: boolean }) {
  return (
    <Badge variant={ativo ? "success" : "outline"}>
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
}
