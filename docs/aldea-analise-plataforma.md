# ALDEA — Portal do Investidor
## Análise completa da plataforma existente

**Fonte:** https://aldea.automy.com.br
**Análise realizada em:** 08/05/2026
**Acesso utilizado:** Administrador

---

## 1. Resumo executivo

A plataforma é um **Portal do Investidor** (não um sistema genérico de gestão empresarial). É uma ferramenta especializada em **gestão de portfólio imobiliário para investidores**, com foco em:

- Cadastro de investidores e unidades imobiliárias que eles possuem ou têm interesse
- Cadastro de empreendimentos com **sistema próprio de precificação qualitativa** (a unidade tem um preço base por m² e ajustes percentuais por atributos: vista, andar, vagas, mobiliado, etc.)
- Geração e gestão de **propostas comerciais** (locação ou venda) com fluxo completo: rascunho → enviada → visualizada → aceita/rejeitada/expirada
- Comunicação transacional via e-mail (templates parametrizados)
- Auditoria de todas as ações
- Relatórios gerenciais com exportação Excel/PDF

A complexidade real do sistema **não está nos cadastros** — está no **motor de precificação** (que combina parâmetros qualitativos do empreendimento com atributos físicos da unidade) e no **fluxo de propostas com rastreamento legal** (IP, user-agent, timeline).

---

## 2. Stack tecnológica observada

### Frontend
- **SPA em React** construída com **Vite** (assets seguem o padrão de hash do Vite: `index-CSe-R3hA.js`)
- Tipografia **Inter** (Google Fonts)
- Idioma único: **Português do Brasil**
- Layout responsivo com sidebar fixa
- Cores principais: rosa/magenta (`#EC4899` aprox.) como cor de marca, azul/violeta para info, verde para sucesso

### Backend
- API REST sob `/api/admin/*`
- Autenticação por **cookie HttpOnly** (não há tokens em localStorage/sessionStorage)
- IDs no formato **UUID v4** (ex.: `70a7f48c-af41-40e4-bea7-64604816cd15`)
- Paginação por query string: `?page=1&pageSize=20`
- Filtros opcionais: `?active=true`

### Endpoints mapeados

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/admin/investors?page=&pageSize=` | Lista de investidores |
| GET | `/api/admin/developments?page=&pageSize=&active=` | Lista de empreendimentos |
| GET | `/api/admin/units?page=&pageSize=` | Lista de unidades |
| GET | `/api/admin/proposals?pageSize=` | Lista de propostas |
| GET | `/api/admin/reports/portfolio` | Dados do relatório de portfólio |
| GET | `/api/admin/reports/units` | Dados do relatório de unidades |
| GET | `/api/admin/reports/conversion` | Funil de conversão |
| GET | `/api/admin/reports/dashboard-charts` | Dados dos gráficos do dashboard |
| GET | `/api/admin/email-templates` | Templates de e-mail |
| GET | `/api/admin/users?page=&pageSize=` | Lista de usuários do sistema |
| GET | `/api/admin/audit?page=&pageSize=` | Logs de auditoria |

Os endpoints POST/PUT/DELETE seguem o mesmo padrão REST por convenção (não foram capturados porque a sessão foi de leitura).

---

## 3. Modelo de dados (engenharia reversa via UI)

### 3.1. Entidade: **Investidor**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | PK |
| nome | string | obrigatório |
| email | string | obrigatório, único |
| telefone | string | formato E.164 (ex: `+55 (19) 99678-9012`) |
| perfil | text | descrição livre — ex: *"Herdou capital, busca alocação em ativos reais"* |
| consentimento_lgpd_em | timestamp | data do aceite |
| criado_em | timestamp | |
| atualizado_em | timestamp | |
| user_id | UUID? | FK opcional para Usuário (login no portal) |

### 3.2. Entidade: **Empreendimento**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | PK |
| nome | string | ex: *ALDEA Riviera Beach* |
| nro_andares | integer | |
| valor_aluguel_m2 | decimal | base para precificação |
| valor_venda_m2 | decimal | |
| preco_medio | decimal | referência |
| caracteristica_lazer | text | ex: *Beach club, piscina aquecida, quadra de tênis* |
| previsao_conclusao | date | |
| ativo | boolean | toggle ativar/desativar |
| imagens | array | até 10 imagens (gallery) |
| criado_em | timestamp | |
| atualizado_em | timestamp | |

### 3.3. Entidade: **Tipo de Unidade** (filho de Empreendimento)

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | |
| empreendimento_id | UUID | FK |
| nome | string | ex: *1 Quarto, 2 Quartos, 3 Quartos Premium, Studio* |
| descricao | text | ex: *42-50m², varanda gourmet* |

### 3.4. Entidade: **Parâmetros Qualitativos** (do Empreendimento)

Esta é a tabela central do **motor de precificação**. Cada empreendimento tem um conjunto de percentuais que serão aplicados às unidades.

| Grupo | Atributo | Tipo | Exemplo |
|---|---|---|---|
| Tipologia | quartos_pct | decimal | +3% por quarto |
| Tipologia | suites_pct | decimal | +5% por suíte |
| Tipologia | banheiros_pct | decimal | +1.8% por banheiro |
| Vagas | vagas_pct | decimal | +4% por vaga |
| Vagas | sem_vaga_pct | decimal | -7% se sem vaga |
| Orientação Solar | face_norte_pct | decimal | +2.5% |
| Orientação Solar | face_sul_pct | decimal | -1% |
| Orientação Solar | face_leste_pct | decimal | +3% |
| Orientação Solar | face_oeste_pct | decimal | -0.5% |
| Posição | frente_pct | decimal | +2% |
| Posição | lateral_pct | decimal | +0.5% |
| Posição | fundos_pct | decimal | -2.5% |
| Vista | vista_mar_pct | decimal | +9% |
| Vista | vista_cidade_pct | decimal | +2% |
| Vista | vista_jardim_pct | decimal | +3% |
| Amenidades | mobiliado_pct | decimal | +14% |
| Amenidades | ar_cond_pct | decimal | +3% |
| Amenidades | andar_alto_pct | decimal | +5.5% (variável conforme andar) |
| Amenidades | varanda_pct | decimal | +4.5% |
| Amenidades | iluminacao_natural_pct | decimal | +2% |

> **Importante:** este conjunto de parâmetros pertence ao empreendimento e não à unidade. O preço sugerido da unidade é calculado dinamicamente.

### 3.5. Entidade: **Unidade**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | PK |
| empreendimento_id | UUID | FK |
| tipo_unidade_id | UUID | FK |
| numero | string | ex: *1206* |
| andar | integer | |
| area_m2 | decimal | |
| **Configuração física** | | |
| quartos | integer | |
| suites | integer | |
| banheiros | integer | |
| vagas | integer | |
| **Posição e vista** | | |
| face_solar | enum | Norte, Sul, Leste, Oeste |
| posicao | enum | Frente, Lateral, Fundos |
| vista | enum | Mar, Cidade, Jardim |
| status | enum | **Em construção, Disponível, Locada, Vendida** |
| **Amenidades** (booleans) | | |
| mobiliado | boolean | |
| ar_condicionado | boolean | |
| andar_alto | boolean | (calculado pelo andar) |
| varanda | boolean | |
| iluminacao_natural | boolean | |
| **Comerciais** | | |
| investidor_id | UUID? | FK opcional |
| tipo_locacao | enum | Longo prazo, Curto prazo |
| variacao_manual_pct | decimal? | override manual no preço |
| perfil_ideal_inquilino | text | |
| estrategia_comercial | text | |
| observacoes | text | |
| ativa | boolean | |
| criado_em | timestamp | |
| atualizado_em | timestamp | |

### 3.6. Entidade: **Proposta**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | PK |
| codigo | string | formato `PROP-XXXX` (ex: `PROP-0067`) |
| investidor_id | UUID | FK |
| vendedor_id | UUID | FK (Usuário com perfil Gestor Comercial) |
| tipo | enum | **Locação, Venda** |
| valor_total | decimal | soma dos valores sugeridos |
| ajuste_pct | decimal? | ajuste manual aplicado |
| valor_final | decimal | valor após ajuste |
| validade | date | |
| observacoes | text | |
| status | enum | **Rascunho, Enviada, Visualizada, Aceita, Rejeitada, Expirada** |
| motivo_recusa | text? | preenchido quando rejeitada |
| ip_origem | string | IP de quem aceitou/rejeitou |
| user_agent | string | navegador completo |
| criado_em | timestamp | |
| atualizado_em | timestamp | |

### 3.7. Entidade: **Item de Proposta** (linha)

| Campo | Tipo |
|---|---|
| id | UUID |
| proposta_id | UUID |
| unidade_id | UUID |
| valor_sugerido | decimal |
| valor_proposto | decimal |

### 3.8. Entidade: **Histórico de Status da Proposta** (timeline)

| Campo | Tipo |
|---|---|
| id | UUID |
| proposta_id | UUID |
| status | enum |
| ocorreu_em | timestamp |
| ip | string? |
| user_agent | string? |

### 3.9. Entidade: **Usuário**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | |
| nome | string | |
| email | string | |
| senha_hash | string | |
| perfil | enum | **Administrador, Gestor Comercial, Investidor** |
| ativo | boolean | |
| ultimo_login | timestamp? | |
| criado_em | timestamp | |

### 3.10. Entidade: **Template de E-mail**

| Campo | Tipo |
|---|---|
| id | UUID |
| codigo | string (slug) |
| nome | string |
| descricao | text |
| assunto | string (com variáveis `{{var}}`) |
| corpo_html | text |
| variaveis | array de strings |

**Templates instalados:**

| Código | Nome | Variáveis |
|---|---|---|
| `welcome` | Boas-vindas ao Investidor | nome, link_portal |
| `new-proposal` | Nova Proposta Comercial | nome, codigo_proposta, link_proposta |
| `proposal-response` | Confirmação de Aceite/Rejeição | nome, codigo_proposta, status, cor_status |
| `password-reset` | Recuperação de Senha | link_reset |
| `admin-alert` | Alerta Administrativo | assunto, mensagem |

### 3.11. Entidade: **Log de E-mail Enviado**

| Campo | Tipo |
|---|---|
| id | UUID |
| template_codigo | string |
| destinatario | email |
| assunto | string |
| status | enum (Enviado, Falha) |
| proposta_id | UUID? |
| enviado_em | timestamp |

### 3.12. Entidade: **Log de Auditoria**

| Campo | Tipo |
|---|---|
| id | UUID |
| ocorreu_em | timestamp |
| usuario_id | UUID |
| usuario_nome | string (denormalizado) |
| tipo_acao | enum (**Criação, Edição, Remoção, Login**) |
| modulo | enum (**Investidores, Unidades, Empreendimentos, Propostas**) |
| descricao | string (ex: *"Criou precificação"*) |
| valor | decimal? (quando aplicável) |
| dados | jsonb? (snapshot da alteração) |

---

## 4. Módulos e telas

### 4.1. Dashboard (`/admin`)

Painel inicial. Cards de KPI no topo:
- Investidores ativos: **18**
- Empreendimentos: **6**
- Total de unidades: **457**
- Valor estimado total: **R$ 2.110.13... /mês**

Gráficos:
- **Ocupação por Empreendimento** (% de unidades alocadas, barras verticais)
- **Funil de Propostas** (Enviadas → Visualizadas → Aceitas → Rejeitadas, com taxas)
- **Top Investidores por Valor Estimado** (barras horizontais com destaque rosa)
- **Valor por Empreendimento** (lista lateral com bullets coloridos)
- Aviso de "88 unidade(s) sem investidor"

### 4.2. Investidores (`/admin/investors`)

- Listagem: Nome, E-mail, Telefone, Unidades (count), Cadastro
- Busca por nome ou e-mail
- **Importar Planilha** (bulk import via Excel)
- Detalhe (`/admin/investors/:id`) com 4 abas:
  - **Dashboard**: KPIs do investidor (Total de Unidades, Valor Estimado do Portfólio, Total de Propostas, Pendentes, Aceitas, Valor Total em Propostas)
  - **Unidades**: lista de unidades vinculadas
  - **Propostas**: histórico
  - **Informações**: dados pessoais + indicador *"Consentimento LGPD registrado em XX/XX/XXXX"*

### 4.3. Empreendimentos (`/admin/developments`)

- Listagem em **grid (cards)** ou lista
- Filtro: Ativos
- Cada card: foto, nome, andares, tipos, unidades, preço/m², toggle ativar/desativar
- Botão **Novo Empreendimento**
- Detalhe com 5 abas:
  - **Informações**: dados gerais + status ativo/inativo
  - **Imagens**: galeria até 10 fotos
  - **Tipos de Unidade**: tabela com Nome, Descrição, Unidades, Ações (editar/excluir)
  - **Unidades**: lista das unidades do empreendimento
  - **Parâmetros**: matriz qualitativa (tipologia, vagas, orientação solar, posição, vista, amenidades) — **núcleo do motor de precificação**

### 4.4. Unidades (`/admin/units`)

- Listagem: Unidade (nº), Empreendimento, Investidor, Tipologia, Andar, Área, Status, Valor Sugerido
- Filtros: Empreendimento, Investidor, Tipologia, Status
- Status enum: **Em construção, Disponível, Locada, Vendida**
- Detalhe com seções: Identificação, Configuração Física, Posição e Vista, Amenidades (com ✓/✗), Dados Comerciais
- Bloco **Precificação calculada** mostrando todos os ajustes aplicados em pílulas:
  - Ex: *3 quarto(s) +7.5%, 1 suíte(s) +4.0%, 2 banheiro(s) +3.0%, 2 vaga(s) +7.0%, Face Norte +2.5%, Frente +2.0%, Vista Cidade +4.0%, Andar alto (12º) +4.0%, Iluminação natural +1.5%*
  - Total: *Base aluguel R$ 5.730,00 (95.5m² × R$ 60/m²) + Ajustes +35.5% = R$ 7.764,15/mês*

### 4.5. Propostas (`/admin/proposals`)

- View **Kanban** (padrão) com colunas por status: Rascunho, Enviada, Visualizada, Aceita, Rejeitada, Expirada
  - Cada coluna mostra a contagem e a soma de valores
- View **Lista** alternativa
- 100 propostas no momento da análise
- Cada card: código (PROP-XXXX), nº unidades, investidor, vendedor, valor/mês, data, ícones de ação (editar, enviar)
- Modal de detalhe com:
  - Cabeçalho (status badge, código)
  - Investidor, Vendedor, Validade
  - Valor Total, Ajuste, Valor Final
  - Observações
  - **Histórico de Status** (timeline com data/hora e IP)
  - IP + User-Agent capturados na aceitação
  - Tabela de unidades (Unidade, Empreendimento, Área, Sugerido, Proposto)
- Tela "Nova Proposta" (`/admin/proposals/new`):
  - Investidor (autocomplete)
  - Vendedor responsável (autocomplete)
  - Tipo: **Locação** ou **Venda**

### 4.6. Relatórios (`/admin/reports`)

4 abas, cada uma com export **Excel** e **PDF**:

- **Portfólio**: investidores ativos, total de unidades, propostas, valor estimado total, gráfico de Top Investidores por Valor
- **Unidades**: empreendimentos, total de unidades, área total, valor médio/unidade, gráfico Unidades + Valor por Empreendimento
- **Propostas**: lista filtrável por status, com colunas Código, Investidor, Status, Valor Final, Unidades, Criação, Resposta
- **Conversão**: funil completo (Enviadas → Visualizadas (68%) → Respondidas (51%) → Aceitas (33%)), gráfico de pizza por status, taxa de conversão e tempo médio de resposta (142.7h)

### 4.7. E-mails (`/admin/emails`)

- Aba **Templates**: 5 templates editáveis com tags de variáveis
- Aba **Log de Envios**: KPIs (Total, Enviados, Falhas, Taxa de sucesso 100%), filtros por status/template/destinatário, tabela com Data/Hora, Destinatário, Assunto, Template, Status, Proposta vinculada

### 4.8. Usuários (`/admin/users`)

- Listagem com busca, filtro por perfil e por status
- Colunas: Nome, E-mail, Perfil, Status, Último Login
- 3 perfis: **Administrador, Gestor Comercial, Investidor**
- Botão Novo Usuário

### 4.9. Auditoria (`/admin/audit`)

- Listagem cronológica de eventos
- Filtros: Tipo de Ação (Criação, Edição, Remoção, Login), Módulo (Investidores, Unidades, Empreendimentos, Propostas), Data Início, Data Fim
- Eventos rastreados além de CRUD: **Fez login, Tentativa de login falhou** (segurança)
- Cada evento mostra: data/hora, usuário, descrição, valor (quando aplicável), expansão para detalhes
- Captura IP em logins

---

## 5. Fluxos de negócio principais

### 5.1. Cadastro de empreendimento → unidades → precificação

1. Cadastro do empreendimento (dados básicos + valores base por m²)
2. Definição dos **Tipos de Unidade** (1 Quarto, 2 Quartos, etc., com áreas de referência)
3. Definição dos **Parâmetros Qualitativos** (matriz de percentuais)
4. Cadastro das unidades (cada uma herda o tipo e tem seus atributos físicos)
5. O sistema calcula automaticamente o **valor sugerido** = `area × valor_m² × (1 + soma_ajustes)`

### 5.2. Geração e ciclo de vida de uma proposta

```
[Vendedor cria]
      ↓
   Rascunho ──────────────────────→ (descartada)
      ↓ envio
   Enviada (e-mail disparado, link com token único)
      ↓ investidor abre o link
   Visualizada (registra timestamp + IP + user-agent)
      ↓ investidor responde
   ┌─────────────┬─────────────┐
   ↓             ↓             ↓
 Aceita      Rejeitada     (sem resposta)
              (motivo)         ↓
                          Expirada (após validade)
```

A cada transição: e-mail transacional + log de auditoria + (em aceitação/rejeição) registro de IP e user-agent para validade legal.

### 5.3. Vendedores e atribuição

Vendedores são usuários com perfil **Gestor Comercial** (Daniela Souza, Felipe Gonçalves, Amanda Torres, Ricardo Silva). Cada proposta tem um vendedor responsável.

---

## 6. Detalhes da experiência (UX)

- Sidebar fixa preta com logo ALDEA
- Item ativo destacado em rosa
- Nome do usuário logado e botão "Sair" no rodapé da sidebar
- Cards de KPI com bordas coloridas suaves no topo (gradiente)
- Status com badges coloridas: verde (aceita/ativo), azul (enviada), violeta (visualizada), vermelho (rejeitada), amarelo (rascunho/em construção/expirada)
- Botões primários em rosa/magenta
- Tabelas listradas, com avatares em círculo (iniciais coloridas) para pessoas
- Modais centralizados com fundo escuro

---

## 7. Considerações para replicação no novo projeto Aldea

### 7.1. Stack recomendada (compatível com o que já está no ar)

| Camada | Recomendação |
|---|---|
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui** |
| Componentes | shadcn/ui (botões, cards, tabs, modais, tabelas) |
| Charts | Recharts ou Chart.js |
| Backend | API Routes do Next.js OU NestJS separado (se quiser API mais robusta) |
| Banco | **PostgreSQL** (via Supabase para acelerar) |
| Auth | Supabase Auth (cookies HttpOnly out-of-the-box) |
| E-mail | Resend ou SendGrid |
| Hospedagem | Vercel (já configurado no projeto) |

### 7.2. Ordem sugerida de implementação (incrementos)

**Sprint 1 — Fundação**
1. Estrutura do projeto + autenticação (login, perfis, layout admin com sidebar)
2. CRUD de Usuários + perfis (Administrador, Gestor Comercial, Investidor)

**Sprint 2 — Cadastros principais**
3. CRUD de Empreendimentos (informações + imagens + tipos de unidade)
4. CRUD de Investidores
5. CRUD de Unidades (configuração física + amenidades)

**Sprint 3 — Motor de precificação**
6. Tela de Parâmetros Qualitativos do empreendimento
7. Cálculo dinâmico de Valor Sugerido na tela da unidade (com pílulas de ajuste)

**Sprint 4 — Propostas**
8. CRUD de Propostas (rascunho)
9. Fluxo de envio (gera link com token, dispara e-mail, status → Enviada)
10. Página pública de visualização para o investidor (sem login, via token, marca como Visualizada)
11. Aceite / Rejeição com captura de IP e user-agent
12. Expiração automática (job agendado)

**Sprint 5 — Comunicação e relatórios**
13. Templates de e-mail (CRUD + preview)
14. Log de envios
15. Relatórios (Portfólio, Unidades, Propostas, Conversão) com export Excel/PDF

**Sprint 6 — Auditoria e refinamentos**
16. Trilha de auditoria automática (middleware nas rotas de mutação)
17. Importação de investidores via planilha
18. Ajustes de UX, responsivo, acessibilidade

### 7.3. Pontos de atenção

- **LGPD:** o sistema atual registra consentimento explícito. Manter esse fluxo desde o cadastro inicial do investidor.
- **Validade jurídica das propostas:** captura de IP + user-agent + timestamps em cada transição é essencial para uso como prova. Considerar também log de IP do vendedor que enviou.
- **Cálculo de "andar alto":** parece ser dinâmico em função do nº de andares do empreendimento (no exemplo, 12º andar em prédio de 18 andares foi marcado como "andar alto +4.0%"). Definir regra clara (ex.: andar > 60% do total).
- **Soft delete:** dado o módulo de Auditoria com tipo "Remoção", o sistema deve marcar registros como deletados (não excluir fisicamente).
- **Prefixo do código de proposta:** padrão `PROP-XXXX` com numeração sequencial. Pode ser implementado com um counter por ano (`PROP-2026-0001`) que é mais robusto.

---

## 8. Próximos passos sugeridos

1. **Confirmar com a Automy** se conseguem fornecer:
   - Repositório de código-fonte do projeto atual
   - Schema completo do banco (DDL ou export do PostgreSQL)
   - Conjunto de dados de teste (export anonimizado)
   - Documentação da API se existir (Swagger/OpenAPI)

2. **Decidir o escopo do MVP** — recomendo começar pelos sprints 1-3 desta análise (fundação, cadastros, precificação) antes de avançar para propostas, que é a parte mais complexa.

3. **Trocar imediatamente as senhas dos usuários** que foram compartilhadas durante esta análise.

4. **Definir os branding tokens** (cor exata do rosa/magenta, fontes, espaçamentos) para que a réplica fique fiel ao visual atual desde o primeiro deploy.

---

*Documento gerado a partir de exploração interativa da plataforma em produção, sem acesso ao código-fonte. Algumas inferências sobre estrutura de banco e endpoints podem precisar de ajuste fino quando o código real for examinado.*
