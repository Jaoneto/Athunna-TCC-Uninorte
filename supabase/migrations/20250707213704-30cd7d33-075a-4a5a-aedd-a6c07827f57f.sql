-- Confirmar usuário existente professor@teste.com
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now() 
WHERE email = 'professor@teste.com';

-- Criar usuários de teste pré-confirmados no auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'joshmelo128@gmail.com',
  crypt('123456789', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Josh Melo", "tipo_perfil": "professor"}'
),
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'joshmelo128+student@gmail.com',
  crypt('123456789', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Josh Estudante", "tipo_perfil": "estudante"}'
) ON CONFLICT (id) DO NOTHING;

-- Atualizar usuários na tabela usuarios
UPDATE public.usuarios 
SET nome_completo = 'Professor Teste Confirmado',
    email = 'professor@teste.com'
WHERE email = 'professor@teste.com';

-- Criar perfis para os novos usuários de teste
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email, 
  tipo_perfil,
  curso,
  semestre,
  bio,
  telefone,
  ativo
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  'Josh Melo',
  'joshmelo128@gmail.com',
  'professor',
  NULL,
  NULL,
  'Professor responsável por workshops de tecnologia e extensão universitária.',
  '(11) 99999-0001',
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'Josh Estudante',
  'joshmelo128+student@gmail.com',
  'estudante',
  'Ciência da Computação',
  '6º Semestre',
  'Estudante interessado em desenvolvimento web e participação em eventos acadêmicos.',
  '(11) 99999-0002',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email,
  tipo_perfil = EXCLUDED.tipo_perfil,
  curso = EXCLUDED.curso,
  semestre = EXCLUDED.semestre,
  bio = EXCLUDED.bio,
  telefone = EXCLUDED.telefone;

-- Criar uma instituição e unidade de teste
INSERT INTO public.instituicoes (
  id,
  nome,
  descricao,
  email,
  telefone,
  ativo
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Universidade de Teste',
  'Instituição acadêmica para testes do sistema Athunna',
  'contato@uniteste.edu.br',
  '(11) 3333-4444',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao;

INSERT INTO public.unidades (
  id,
  nome,
  instituicao_id,
  endereco,
  bairro,
  municipio,
  estado,
  cep,
  ativo
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  'Campus Central',
  '55555555-5555-5555-5555-555555555555',
  'Rua dos Testes, 123',
  'Centro',
  'São Paulo',
  'SP',
  '01234-567',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  endereco = EXCLUDED.endereco;

-- Associar usuários à unidade de teste
UPDATE public.usuarios 
SET unidade_id = '66666666-6666-6666-6666-666666666666'
WHERE id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- Criar eventos de exemplo
INSERT INTO public.eventos (
  id,
  titulo,
  descricao,
  data_inicio,
  data_fim,
  local,
  tipo_evento,
  participantes_max,
  criado_por,
  unidade_id,
  ativo
) VALUES 
(
  '77777777-7777-7777-7777-777777777777',
  'Workshop de React e TypeScript',
  'Aprenda os fundamentos do desenvolvimento moderno com React e TypeScript. Evento prático com projeto hands-on.',
  '2025-08-15 14:00:00+00',
  '2025-08-15 18:00:00+00',
  'Laboratório de Informática - Sala 201',
  'workshop',
  30,
  '33333333-3333-3333-3333-333333333333',
  '66666666-6666-6666-6666-666666666666',
  true
),
(
  '88888888-8888-8888-8888-888888888888',
  'Palestra: Tendências em IA',
  'Discussão sobre as últimas tendências em Inteligência Artificial e seus impactos na sociedade.',
  '2025-08-20 19:00:00+00',
  '2025-08-20 21:00:00+00',
  'Auditório Principal',
  'palestra',
  100,
  '33333333-3333-3333-3333-333333333333',
  '66666666-6666-6666-6666-666666666666',
  true
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao;