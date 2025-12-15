-- Adicionar política RESTRICTIVE de defesa em profundidade para user_roles
-- Esta política garante que apenas usuários autenticados podem acessar a tabela
-- mesmo que a função is_admin() falhe ou retorne NULL

CREATE POLICY "Require authentication for user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);