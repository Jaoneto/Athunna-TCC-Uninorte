-- Atualizar a senha do usuário administrador para algo mais simples
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'juniormelo884@gmail.com';