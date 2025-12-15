-- Inserir usuários de teste na tabela usuarios
-- (Estes usuários serão criados via Supabase Auth posteriormente)

-- Professor de teste
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email, 
  tipo_perfil, 
  ativo
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Professor Teste',
  'professor@teste.com',
  'professor',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email,
  tipo_perfil = EXCLUDED.tipo_perfil;

-- Estudante de teste
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email, 
  tipo_perfil,
  curso,
  semestre, 
  ativo
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Estudante Teste',
  'estudante@teste.com',
  'estudante',
  'Engenharia de Software',
  '5º Semestre',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email,
  tipo_perfil = EXCLUDED.tipo_perfil,
  curso = EXCLUDED.curso,
  semestre = EXCLUDED.semestre;