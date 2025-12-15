-- Criar um usuário admin de teste para facilitar os testes
-- Primeiro vamos inserir diretamente na tabela usuarios (sem auth.users)
INSERT INTO public.usuarios (
  id, 
  nome_completo, 
  email, 
  tipo_perfil,
  ativo
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Admin Teste',
  'admin@teste.com',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  email = EXCLUDED.email,
  tipo_perfil = EXCLUDED.tipo_perfil;