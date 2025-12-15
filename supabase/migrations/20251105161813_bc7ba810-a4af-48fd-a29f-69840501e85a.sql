-- Atualizar política para permitir professores verem participações
DROP POLICY IF EXISTS "Users can view own participations" ON participacoes_atividades;

CREATE POLICY "Users and professors can view participations"
ON participacoes_atividades
FOR SELECT
USING (
  usuario_id = auth.uid() 
  OR is_admin(auth.uid())
  OR get_user_role(auth.uid()) = 'professor'::app_role
);

-- Atualizar política ALL para permitir que admin e professores gerenciem
DROP POLICY IF EXISTS "Users can manage own participations" ON participacoes_atividades;

CREATE POLICY "Users can manage own participations"
ON participacoes_atividades
FOR ALL
USING (
  usuario_id = auth.uid() 
  OR is_admin(auth.uid())
  OR get_user_role(auth.uid()) = 'professor'::app_role
);