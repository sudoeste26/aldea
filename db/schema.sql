-- ============================================================
-- ALDEA — Schema PostgreSQL
-- Executar no Supabase SQL Editor
-- ============================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type perfil_usuario as enum ('Administrador', 'Gestor Comercial', 'Investidor');
create type status_unidade as enum ('Em construção', 'Disponível', 'Locada', 'Vendida');
create type face_solar as enum ('Norte', 'Sul', 'Leste', 'Oeste');
create type posicao_unidade as enum ('Frente', 'Lateral', 'Fundos');
create type vista_unidade as enum ('Mar', 'Cidade', 'Jardim');
create type tipo_locacao as enum ('Longo prazo', 'Curto prazo');
create type tipo_proposta as enum ('Locação', 'Venda');
create type status_proposta as enum ('Rascunho', 'Enviada', 'Visualizada', 'Aceita', 'Rejeitada', 'Expirada');
create type tipo_acao_audit as enum ('Criação', 'Edição', 'Remoção', 'Login');
create type modulo_audit as enum ('Usuários', 'Investidores', 'Unidades', 'Empreendimentos', 'Propostas');
create type status_email as enum ('Enviado', 'Falha');

-- ============================================================
-- USUÁRIOS
-- ============================================================

create table usuarios (
  id          uuid primary key default uuid_generate_v4(),
  auth_id     uuid unique,                    -- FK para auth.users do Supabase
  nome        text not null,
  email       text not null unique,
  perfil      perfil_usuario not null default 'Gestor Comercial',
  ativo       boolean not null default true,
  ultimo_login timestamptz,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  deletado_em timestamptz                     -- soft delete
);

create index idx_usuarios_email on usuarios(email);
create index idx_usuarios_perfil on usuarios(perfil);
create index idx_usuarios_ativo on usuarios(ativo) where deletado_em is null;

-- ============================================================
-- INVESTIDORES
-- ============================================================

create table investidores (
  id                   uuid primary key default uuid_generate_v4(),
  nome                 text not null,
  email                text not null unique,
  telefone             text,
  perfil               text,
  consentimento_lgpd_em timestamptz,
  usuario_id           uuid references usuarios(id) on delete set null,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  deletado_em          timestamptz
);

create index idx_investidores_email on investidores(email);
create index idx_investidores_usuario on investidores(usuario_id);

-- ============================================================
-- EMPREENDIMENTOS
-- ============================================================

create table empreendimentos (
  id                   uuid primary key default uuid_generate_v4(),
  nome                 text not null,
  nro_andares          integer not null default 1,
  valor_aluguel_m2     numeric(10,2) not null default 0,
  valor_venda_m2       numeric(10,2) not null default 0,
  preco_medio          numeric(12,2),
  caracteristica_lazer text,
  previsao_conclusao   date,
  ativo                boolean not null default true,
  imagens              text[] default '{}',   -- URLs do Supabase Storage
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  deletado_em          timestamptz
);

-- ============================================================
-- TIPOS DE UNIDADE (filho de Empreendimento)
-- ============================================================

create table tipos_unidade (
  id                uuid primary key default uuid_generate_v4(),
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  nome              text not null,
  descricao         text,
  criado_em         timestamptz not null default now()
);

create index idx_tipos_unidade_empreendimento on tipos_unidade(empreendimento_id);

-- ============================================================
-- PARÂMETROS QUALITATIVOS (motor de precificação)
-- ============================================================

create table parametros_qualitativos (
  id                uuid primary key default uuid_generate_v4(),
  empreendimento_id uuid not null unique references empreendimentos(id) on delete cascade,
  -- Tipologia
  quartos_pct       numeric(5,2) default 0,
  suites_pct        numeric(5,2) default 0,
  banheiros_pct     numeric(5,2) default 0,
  -- Vagas
  vagas_pct         numeric(5,2) default 0,
  sem_vaga_pct      numeric(5,2) default 0,
  -- Orientação Solar
  face_norte_pct    numeric(5,2) default 0,
  face_sul_pct      numeric(5,2) default 0,
  face_leste_pct    numeric(5,2) default 0,
  face_oeste_pct    numeric(5,2) default 0,
  -- Posição
  frente_pct        numeric(5,2) default 0,
  lateral_pct       numeric(5,2) default 0,
  fundos_pct        numeric(5,2) default 0,
  -- Vista
  vista_mar_pct     numeric(5,2) default 0,
  vista_cidade_pct  numeric(5,2) default 0,
  vista_jardim_pct  numeric(5,2) default 0,
  -- Amenidades
  mobiliado_pct     numeric(5,2) default 0,
  ar_cond_pct       numeric(5,2) default 0,
  andar_alto_pct    numeric(5,2) default 0,
  varanda_pct       numeric(5,2) default 0,
  iluminacao_natural_pct numeric(5,2) default 0,
  -- Controle de andar alto (percentual mínimo do total de andares)
  andar_alto_threshold numeric(3,2) default 0.60,
  atualizado_em     timestamptz not null default now()
);

-- ============================================================
-- UNIDADES
-- ============================================================

create table unidades (
  id                  uuid primary key default uuid_generate_v4(),
  empreendimento_id   uuid not null references empreendimentos(id) on delete restrict,
  tipo_unidade_id     uuid references tipos_unidade(id) on delete set null,
  numero              text not null,
  andar               integer not null,
  area_m2             numeric(8,2) not null,
  -- Configuração física
  quartos             integer not null default 0,
  suites              integer not null default 0,
  banheiros           integer not null default 0,
  vagas               integer not null default 0,
  -- Posição e vista
  face_solar          face_solar,
  posicao             posicao_unidade,
  vista               vista_unidade,
  status              status_unidade not null default 'Disponível',
  -- Amenidades
  mobiliado           boolean not null default false,
  ar_condicionado     boolean not null default false,
  varanda             boolean not null default false,
  iluminacao_natural  boolean not null default false,
  -- Comercial
  investidor_id       uuid references investidores(id) on delete set null,
  tipo_locacao        tipo_locacao,
  variacao_manual_pct numeric(5,2),
  perfil_ideal_inquilino text,
  estrategia_comercial   text,
  observacoes            text,
  ativa               boolean not null default true,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  deletado_em         timestamptz,
  unique(empreendimento_id, numero)
);

create index idx_unidades_empreendimento on unidades(empreendimento_id);
create index idx_unidades_investidor on unidades(investidor_id);
create index idx_unidades_status on unidades(status);

-- ============================================================
-- PROPOSTAS
-- ============================================================

create sequence proposta_seq start 1;

create table propostas (
  id            uuid primary key default uuid_generate_v4(),
  codigo        text not null unique default 'PROP-' || lpad(nextval('proposta_seq')::text, 4, '0'),
  investidor_id uuid not null references investidores(id) on delete restrict,
  vendedor_id   uuid not null references usuarios(id) on delete restrict,
  tipo          tipo_proposta not null,
  valor_total   numeric(14,2) not null default 0,
  ajuste_pct    numeric(5,2),
  valor_final   numeric(14,2) not null default 0,
  validade      date not null,
  observacoes   text,
  status        status_proposta not null default 'Rascunho',
  motivo_recusa text,
  token         uuid unique default uuid_generate_v4(),   -- link público
  ip_origem     text,
  user_agent    text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  deletado_em   timestamptz
);

create index idx_propostas_investidor on propostas(investidor_id);
create index idx_propostas_vendedor on propostas(vendedor_id);
create index idx_propostas_status on propostas(status);
create index idx_propostas_token on propostas(token);

-- ============================================================
-- ITENS DE PROPOSTA
-- ============================================================

create table itens_proposta (
  id              uuid primary key default uuid_generate_v4(),
  proposta_id     uuid not null references propostas(id) on delete cascade,
  unidade_id      uuid not null references unidades(id) on delete restrict,
  valor_sugerido  numeric(14,2) not null,
  valor_proposto  numeric(14,2) not null
);

create index idx_itens_proposta_proposta on itens_proposta(proposta_id);

-- ============================================================
-- HISTÓRICO DE STATUS DA PROPOSTA
-- ============================================================

create table historico_proposta (
  id          uuid primary key default uuid_generate_v4(),
  proposta_id uuid not null references propostas(id) on delete cascade,
  status      status_proposta not null,
  ocorreu_em  timestamptz not null default now(),
  ip          text,
  user_agent  text
);

create index idx_historico_proposta on historico_proposta(proposta_id);

-- ============================================================
-- TEMPLATES DE E-MAIL
-- ============================================================

create table email_templates (
  id          uuid primary key default uuid_generate_v4(),
  codigo      text not null unique,
  nome        text not null,
  descricao   text,
  assunto     text not null,
  corpo_html  text not null,
  variaveis   text[] default '{}',
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- LOG DE E-MAILS ENVIADOS
-- ============================================================

create table email_logs (
  id               uuid primary key default uuid_generate_v4(),
  template_codigo  text not null,
  destinatario     text not null,
  assunto          text not null,
  status           status_email not null,
  proposta_id      uuid references propostas(id) on delete set null,
  enviado_em       timestamptz not null default now()
);

create index idx_email_logs_proposta on email_logs(proposta_id);
create index idx_email_logs_enviado_em on email_logs(enviado_em desc);

-- ============================================================
-- LOG DE AUDITORIA
-- ============================================================

create table audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  ocorreu_em     timestamptz not null default now(),
  usuario_id     uuid references usuarios(id) on delete set null,
  usuario_nome   text not null,
  tipo_acao      tipo_acao_audit not null,
  modulo         modulo_audit not null,
  descricao      text not null,
  valor          numeric(14,2),
  dados          jsonb,
  ip             text
);

create index idx_audit_logs_usuario on audit_logs(usuario_id);
create index idx_audit_logs_ocorreu_em on audit_logs(ocorreu_em desc);
create index idx_audit_logs_modulo on audit_logs(modulo);

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================

create or replace function set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_usuarios_atualizado_em
  before update on usuarios
  for each row execute function set_atualizado_em();

create trigger trg_investidores_atualizado_em
  before update on investidores
  for each row execute function set_atualizado_em();

create trigger trg_empreendimentos_atualizado_em
  before update on empreendimentos
  for each row execute function set_atualizado_em();

create trigger trg_unidades_atualizado_em
  before update on unidades
  for each row execute function set_atualizado_em();

create trigger trg_propostas_atualizado_em
  before update on propostas
  for each row execute function set_atualizado_em();
