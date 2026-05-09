-- ============================================================
-- SEED: Templates de e-mail + admin padrão
-- Executar após schema.sql
-- ============================================================

-- Templates de e-mail
insert into email_templates (codigo, nome, descricao, assunto, corpo_html, variaveis) values
(
  'welcome',
  'Boas-vindas ao Investidor',
  'Enviado quando um novo investidor é cadastrado e recebe acesso ao portal',
  'Bem-vindo ao Portal ALDEA, {{nome}}!',
  '<h1>Olá, {{nome}}!</h1><p>Seu acesso ao Portal do Investidor ALDEA está pronto.</p><p><a href="{{link_portal}}">Acessar Portal</a></p>',
  array['nome', 'link_portal']
),
(
  'new-proposal',
  'Nova Proposta Comercial',
  'Enviado ao investidor quando uma proposta é enviada',
  'Nova proposta {{codigo_proposta}} disponível para você',
  '<h1>Olá, {{nome}}!</h1><p>Uma nova proposta comercial ({{codigo_proposta}}) foi preparada para você.</p><p><a href="{{link_proposta}}">Ver Proposta</a></p>',
  array['nome', 'codigo_proposta', 'link_proposta']
),
(
  'proposal-response',
  'Confirmação de Aceite/Rejeição',
  'Enviado ao vendedor quando o investidor responde à proposta',
  'Proposta {{codigo_proposta}} foi {{status}}',
  '<h1>Proposta respondida</h1><p>A proposta {{codigo_proposta}} foi <strong style="color:{{cor_status}}">{{status}}</strong> por {{nome}}.</p>',
  array['nome', 'codigo_proposta', 'status', 'cor_status']
),
(
  'password-reset',
  'Recuperação de Senha',
  'Enviado quando o usuário solicita redefinição de senha',
  'Redefinição de senha — ALDEA',
  '<h1>Redefinição de senha</h1><p>Clique no link abaixo para redefinir sua senha. O link expira em 1 hora.</p><p><a href="{{link_reset}}">Redefinir Senha</a></p>',
  array['link_reset']
),
(
  'admin-alert',
  'Alerta Administrativo',
  'Template genérico para alertas internos',
  '{{assunto}}',
  '<h1>Alerta ALDEA</h1><p>{{mensagem}}</p>',
  array['assunto', 'mensagem']
);

-- Nota: o usuário administrador deve ser criado via Supabase Auth Dashboard
-- ou via script separado com service_role key.
-- Após criar via Auth, execute:
--
-- insert into usuarios (auth_id, nome, email, perfil)
-- values ('<UUID do auth.users>', 'Administrador', 'admin@aldea.com.br', 'Administrador');
