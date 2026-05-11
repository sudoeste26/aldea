# Tarefa: Implementar Sprint 2 do projeto Aldea

Leia primeiro `docs/aldea-analise-plataforma.md` para entender o produto e as entidades.

O projeto ja tem o modulo de Usuarios funcionando em `app/admin/usuarios/`. Use ele como TEMPLATE para os novos modulos. NAO modifique Usuarios.

## Modulos a implementar (nesta ordem)

### 1. Investidores (`app/admin/investidores/`)

CRUD completo seguindo o padrao de Usuarios. Campos da tabela `investidores`:
- nome, email, telefone, perfil (texto livre), criado_em, atualizado_em, consentimento_lgpd_em

Tela de listagem: colunas Nome, E-mail, Telefone, Unidades (count via subquery), Cadastro. Busca por nome/email. Botao Novo Investidor.

Detalhe (`/admin/investidores/[id]`): mostre dados pessoais com botao Editar. Por enquanto so essa aba (Dashboard/Unidades/Propostas vem depois).

API em `app/api/investidores/route.ts` (GET, POST) e `app/api/investidores/[id]/route.ts` (GET, PUT, DELETE) com validacao Zod em `lib/validators/investidor.ts`.

Use `lib/audit.ts` em todas mutacoes (modulo='Investidores').

### 2. Empreendimentos (`app/admin/empreendimentos/`)

CRUD com listagem em GRID de cards (foto + nome + andares + tipos + unidades). Campos da tabela `empreendimentos`: nome, nro_andares, valor_aluguel_m2, valor_venda_m2, preco_medio, caracteristica_lazer, previsao_conclusao, ativo.

Detalhe com TABS:
- Informacoes (dados gerais + toggle Ativar/Desativar)
- Tipos de Unidade (lista da tabela `tipos_unidade`: nome + descricao + count)
- Parametros (todos campos da tabela `parametros_qualitativos` em forma editavel)

Pule a aba Imagens (galeria) por agora. Pule a aba Unidades dentro do detalhe (vamos ter pagina propria).

APIs paralelas e validators.

### 3. Unidades (`app/admin/unidades/`)

CRUD com listagem em tabela: Unidade, Empreendimento, Investidor, Tipologia, Andar, Area, Status, Valor Sugerido.

Filtros: Empreendimento, Investidor, Tipologia, Status.

Detalhe com secoes Identificacao / Configuracao Fisica / Posicao e Vista / Amenidades / Dados Comerciais.

**MOTOR DE PRECIFICACAO** em `lib/pricing.ts`:
```typescript
export function calcularPreco(unidade, empreendimento, parametros) {
  const base = unidade.area_m2 * empreendimento.valor_aluguel_m2;
  const ajustes = [];
  // tipologia
  if (unidade.quartos > 0) ajustes.push({ label: `${unidade.quartos} quarto(s)`, pct: parametros.quartos_pct * unidade.quartos });
  if (unidade.suites > 0) ajustes.push({ label: `${unidade.suites} suite(s)`, pct: parametros.suites_pct * unidade.suites });
  // ... seguir o padrao para banheiros, vagas (com vagas_pct ou sem_vaga_pct), face solar, posicao, vista, amenidades booleanas (mobiliado, ar_condicionado, andar_alto se andar > 60% do total, varanda, iluminacao_natural)
  const totalPct = ajustes.reduce((s, a) => s + a.pct, 0) + (unidade.variacao_manual_pct ?? 0);
  const valorFinal = base * (1 + totalPct / 100);
  return { base, ajustes, totalPct, valorFinal };
}
```

Exibir essa precificacao na tela de detalhe da unidade em "piloulas" verdes (igual ao print no docs/aldea-analise-plataforma.md secao 4.4).

### 4. Dashboard com dados reais

Em `app/admin/page.tsx`, popular os 4 cards com queries Supabase:
- Investidores ativos = count(investidores)
- Empreendimentos = count(empreendimentos where ativo=true)
- Total de unidades = count(unidades)
- Valor estimado total = sum dos valores calculados pelo motor de preco para todas as unidades

Manter o stub "Graficos serao implementados no Sprint 2" -> trocar por placeholder "Sprint 3".

### 5. Sidebar

Os links da sidebar ja apontam para `/admin/investidores`, `/admin/empreendimentos`, `/admin/unidades`. Apos criar as paginas, as rotas vao funcionar automaticamente. Confirme.

## Padroes obrigatorios

- Use shadcn/ui ja instalado: Button, Card, Dialog, Input, Label, Select, Toast
- Server Components para listagem (busca dados); Client Components para formularios
- Validacao com Zod em `lib/validators/*`
- Estados: skeleton loading, mensagens de erro, sucesso via toast
- Cores: rosa primario (#EC4899), badges verdes para sucesso/ativo, vermelhas para inativo/erro
- Audit log em TODA mutacao (chamada para `lib/audit.ts`)
- Tipagem TypeScript estrita
- Sem RLS por enquanto (cliente Supabase usa service role no server)

## Validacao

Ao terminar:
1. Rodar `npm run build` ate passar 100%
2. Se der erro, corrigir e re-rodar ate passar
3. Quando build passar, faca `git add -A && git commit -m 'feat: Sprint 2 (Investidores, Empreendimentos, Unidades + motor de preco)' && git push`

NAO peca aprovacao para cada acao. Trabalhe autonomo. Va.
