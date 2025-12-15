-- =========================================
-- ATUALIZAÇÃO DE RLS POLICIES - SISTEMA DE ROLES
-- =========================================

-- Limpar policies antigas e criar as novas
-- EVENTOS
DROP POLICY IF EXISTS "Admins and professors can create events" ON eventos;
DROP POLICY IF EXISTS "Admins and event owners can update events" ON eventos;
DROP POLICY IF EXISTS "Admins can delete events" ON eventos;
DROP POLICY IF EXISTS "Everyone can view active events" ON eventos;

-- Professores e admins podem criar eventos
CREATE POLICY "Professors and admins can create events"
ON eventos FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'professor'
);

-- Professores podem ver seus eventos + eventos ativos, admins veem todos
CREATE POLICY "Users can view events by role"
ON eventos FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  responsavel_id = auth.uid() OR
  status = 'ativo'
);

-- Professores podem editar apenas seus eventos, admins podem editar todos
CREATE POLICY "Professors can update own events"
ON eventos FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  responsavel_id = auth.uid()
);

-- Apenas admins podem deletar eventos
CREATE POLICY "Only admins can delete events"
ON eventos FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- ATIVIDADES
DROP POLICY IF EXISTS "Admins and professors can manage activities" ON atividades;
DROP POLICY IF EXISTS "Everyone can view activities" ON atividades;

-- Professores e admins podem criar atividades
CREATE POLICY "Professors and admins can create activities"
ON atividades FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Professores veem atividades dos seus eventos, estudantes e admins veem todas
CREATE POLICY "Users can view activities by role"
ON atividades FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'estudante' OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Professores editam atividades dos seus eventos, admins editam todas
CREATE POLICY "Professors can update own activities"
ON atividades FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Professores deletam atividades dos seus eventos, admins deletam todas
CREATE POLICY "Professors can delete own activities"
ON atividades FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- PARTICIPACOES_ATIVIDADES
DROP POLICY IF EXISTS "Users and professors can view participations" ON participacoes_atividades;
DROP POLICY IF EXISTS "Users can manage own participations" ON participacoes_atividades;

-- Estudantes veem próprias participações, professores veem de seus eventos, admins veem todas
CREATE POLICY "Users can view participations by role"
ON participacoes_atividades FOR SELECT
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  atividade_id IN (
    SELECT a.id FROM atividades a
    JOIN eventos e ON a.evento_id = e.id
    WHERE e.responsavel_id = auth.uid()
  )
);

-- Estudantes criam próprias participações, admins e professores podem criar para seus eventos
CREATE POLICY "Users can create participations by role"
ON participacoes_atividades FOR INSERT
TO authenticated
WITH CHECK (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  atividade_id IN (
    SELECT a.id FROM atividades a
    JOIN eventos e ON a.evento_id = e.id
    WHERE e.responsavel_id = auth.uid()
  )
);

-- Professores podem marcar presença nos seus eventos, estudantes atualizam próprias, admins tudo
CREATE POLICY "Users can update participations by role"
ON participacoes_atividades FOR UPDATE
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  atividade_id IN (
    SELECT a.id FROM atividades a
    JOIN eventos e ON a.evento_id = e.id
    WHERE e.responsavel_id = auth.uid()
  )
);

-- Estudantes deletam próprias participações, admins e professores podem deletar de seus eventos
CREATE POLICY "Users can delete participations by role"
ON participacoes_atividades FOR DELETE
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  atividade_id IN (
    SELECT a.id FROM atividades a
    JOIN eventos e ON a.evento_id = e.id
    WHERE e.responsavel_id = auth.uid()
  )
);

-- CERTIFICADOS
DROP POLICY IF EXISTS "System can create certificates" ON certificados;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificados;

-- Professores podem emitir certificados dos seus eventos, admins podem emitir todos
CREATE POLICY "Professors can create certificates for own events"
ON certificados FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Estudantes veem próprios certificados, professores veem de seus eventos, admins veem todos
CREATE POLICY "Users can view certificates by role"
ON certificados FOR SELECT
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Admins e professores podem atualizar certificados de seus eventos
CREATE POLICY "Professors can update own event certificates"
ON certificados FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- INSCRICOES_EVENTOS
DROP POLICY IF EXISTS "Users can create own registrations" ON inscricoes_eventos;
DROP POLICY IF EXISTS "Users can delete own registrations" ON inscricoes_eventos;
DROP POLICY IF EXISTS "Users can update own registrations" ON inscricoes_eventos;
DROP POLICY IF EXISTS "Users can view own registrations" ON inscricoes_eventos;

-- Estudantes criam próprias inscrições
CREATE POLICY "Students can create own registrations"
ON inscricoes_eventos FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- Estudantes veem próprias, professores veem de seus eventos, admins veem todas
CREATE POLICY "Users can view registrations by role"
ON inscricoes_eventos FOR SELECT
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Estudantes atualizam próprias, professores atualizam de seus eventos, admins atualizam todas
CREATE POLICY "Users can update registrations by role"
ON inscricoes_eventos FOR UPDATE
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);

-- Estudantes deletam próprias, professores deletam de seus eventos, admins deletam todas
CREATE POLICY "Users can delete registrations by role"
ON inscricoes_eventos FOR DELETE
TO authenticated
USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  evento_id IN (
    SELECT id FROM eventos WHERE responsavel_id = auth.uid()
  )
);