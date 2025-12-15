-- Criar usuário administrador no auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'juniormelo884@gmail.com',
  crypt('Jesus@994523595', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Jesus Travessa de Melo Júnior", "tipo_perfil": "admin"}'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Criar perfil do administrador na tabela usuarios
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email, 
  tipo_perfil,
  unidade_id,
  ativo
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Jesus Travessa de Melo Júnior',
  'juniormelo884@gmail.com',
  'admin',
  '66666666-6666-6666-6666-666666666666', -- Campus Central da Universidade de Teste
  true
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email,
  tipo_perfil = EXCLUDED.tipo_perfil,
  unidade_id = EXCLUDED.unidade_id;