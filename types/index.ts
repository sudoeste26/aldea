export type PerfilUsuario = "Administrador" | "Gestor Comercial" | "Investidor";
export type StatusUnidade = "Em construção" | "Disponível" | "Locada" | "Vendida";
export type FaceSolar = "Norte" | "Sul" | "Leste" | "Oeste";
export type PosicaoUnidade = "Frente" | "Lateral" | "Fundos";
export type VistaUnidade = "Mar" | "Cidade" | "Jardim";
export type TipoLocacao = "Longo prazo" | "Curto prazo";
export type TipoProposta = "Locação" | "Venda";
export type StatusProposta =
  | "Rascunho"
  | "Enviada"
  | "Visualizada"
  | "Aceita"
  | "Rejeitada"
  | "Expirada";
export type TipoAcaoAudit = "Criação" | "Edição" | "Remoção" | "Login";
export type ModuloAudit =
  | "Usuários"
  | "Investidores"
  | "Unidades"
  | "Empreendimentos"
  | "Propostas";

export interface Usuario {
  id: string;
  auth_id: string | null;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  ultimo_login: string | null;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface Investidor {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: string | null;
  consentimento_lgpd_em: string | null;
  usuario_id: string | null;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface Empreendimento {
  id: string;
  nome: string;
  nro_andares: number;
  valor_aluguel_m2: number;
  valor_venda_m2: number;
  preco_medio: number | null;
  caracteristica_lazer: string | null;
  previsao_conclusao: string | null;
  ativo: boolean;
  imagens: string[];
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface TipoUnidade {
  id: string;
  empreendimento_id: string;
  nome: string;
  descricao: string | null;
  criado_em: string;
}

export interface ParametrosQualitativos {
  id: string;
  empreendimento_id: string;
  quartos_pct: number;
  suites_pct: number;
  banheiros_pct: number;
  vagas_pct: number;
  sem_vaga_pct: number;
  face_norte_pct: number;
  face_sul_pct: number;
  face_leste_pct: number;
  face_oeste_pct: number;
  frente_pct: number;
  lateral_pct: number;
  fundos_pct: number;
  vista_mar_pct: number;
  vista_cidade_pct: number;
  vista_jardim_pct: number;
  mobiliado_pct: number;
  ar_cond_pct: number;
  andar_alto_pct: number;
  varanda_pct: number;
  iluminacao_natural_pct: number;
  andar_alto_threshold: number;
  atualizado_em: string;
}

export interface Unidade {
  id: string;
  empreendimento_id: string;
  tipo_unidade_id: string | null;
  numero: string;
  andar: number;
  area_m2: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  face_solar: FaceSolar | null;
  posicao: PosicaoUnidade | null;
  vista: VistaUnidade | null;
  status: StatusUnidade;
  mobiliado: boolean;
  ar_condicionado: boolean;
  varanda: boolean;
  iluminacao_natural: boolean;
  investidor_id: string | null;
  tipo_locacao: TipoLocacao | null;
  variacao_manual_pct: number | null;
  perfil_ideal_inquilino: string | null;
  estrategia_comercial: string | null;
  observacoes: string | null;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface Proposta {
  id: string;
  codigo: string;
  investidor_id: string;
  vendedor_id: string;
  tipo: TipoProposta;
  valor_total: number;
  ajuste_pct: number | null;
  valor_final: number;
  validade: string;
  observacoes: string | null;
  status: StatusProposta;
  motivo_recusa: string | null;
  token: string;
  ip_origem: string | null;
  user_agent: string | null;
  criado_em: string;
  atualizado_em: string;
  deletado_em: string | null;
}

export interface ItemProposta {
  id: string;
  proposta_id: string;
  unidade_id: string;
  valor_sugerido: number;
  valor_proposto: number;
}

export interface HistoricoProposta {
  id: string;
  proposta_id: string;
  status: StatusProposta;
  ocorreu_em: string;
  ip: string | null;
  user_agent: string | null;
}

export interface EmailTemplate {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  assunto: string;
  corpo_html: string;
  variaveis: string[];
  atualizado_em: string;
}

export interface AuditLog {
  id: string;
  ocorreu_em: string;
  usuario_id: string | null;
  usuario_nome: string;
  tipo_acao: TipoAcaoAudit;
  modulo: ModuloAudit;
  descricao: string;
  valor: number | null;
  dados: Record<string, unknown> | null;
  ip: string | null;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
