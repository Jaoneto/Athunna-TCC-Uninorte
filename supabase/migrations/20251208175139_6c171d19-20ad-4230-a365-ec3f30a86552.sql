-- =============================================
-- ETAPA 1: Corrigir políticas da tabela usuarios
-- Garantir que usuários só vejam seus próprios dados
-- =============================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Require authentication for usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own profile " ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all profiles " ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own profile " ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile " ON public.usuarios;

-- Política base RESTRICTIVA: requer autenticação
CREATE POLICY "Require authentication for usuarios"
ON public.usuarios
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Política PERMISSIVA: usuários veem APENAS seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.usuarios
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política PERMISSIVA: admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.usuarios
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin_safe(auth.uid()));

-- Política PERMISSIVA: usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile"
ON public.usuarios
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política PERMISSIVA: usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.usuarios
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- =============================================
-- ETAPA 2: Criar tabela de auditoria para dados sensíveis
-- =============================================

CREATE TABLE IF NOT EXISTS public.sensitive_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  action_type text NOT NULL DEFAULT 'VIEW',
  fields_accessed text[] DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.sensitive_data_audit ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de auditoria (somente leitura)
CREATE POLICY "Admins can view audit logs"
ON public.sensitive_data_audit
FOR SELECT
TO authenticated
USING (is_admin_safe(auth.uid()));

-- Sistema pode inserir logs de auditoria
CREATE POLICY "System can insert audit logs"
ON public.sensitive_data_audit
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND is_admin_safe(auth.uid()));

-- =============================================
-- ETAPA 3: Função para buscar inscrições públicas com auditoria
-- =============================================

CREATE OR REPLACE FUNCTION public.get_inscricoes_publicas_audited(
  _evento_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  evento_id uuid,
  nome_completo text,
  email text,
  telefone text,
  tipo_vinculo text,
  matricula text,
  cpf_masked text,
  status text,
  data_inscricao timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver inscrições públicas';
  END IF;

  -- Registrar acesso na auditoria
  INSERT INTO sensitive_data_audit (
    accessed_by,
    table_name,
    action_type,
    fields_accessed
  ) VALUES (
    auth.uid(),
    'inscricoes_publicas',
    'VIEW_LIST',
    ARRAY['nome_completo', 'email', 'telefone', 'cpf', 'matricula']
  );

  -- Retornar dados com CPF mascarado
  RETURN QUERY
  SELECT 
    ip.id,
    ip.evento_id,
    ip.nome_completo,
    ip.email,
    ip.telefone,
    ip.tipo_vinculo,
    ip.matricula,
    -- Mascarar CPF: mostrar apenas primeiros 3 e últimos 2 dígitos
    CASE 
      WHEN ip.cpf IS NOT NULL AND length(ip.cpf) = 11 THEN
        substring(ip.cpf, 1, 3) || '.***.***-' || substring(ip.cpf, 10, 2)
      WHEN ip.cpf IS NOT NULL THEN
        '***.***.***-**'
      ELSE NULL
    END as cpf_masked,
    ip.status,
    ip.data_inscricao,
    ip.created_at
  FROM inscricoes_publicas ip
  WHERE (_evento_id IS NULL OR ip.evento_id = _evento_id)
  ORDER BY ip.created_at DESC;
END;
$$;

-- =============================================
-- ETAPA 4: Função para ver CPF completo (com auditoria extra)
-- =============================================

CREATE OR REPLACE FUNCTION public.get_cpf_full_audited(_inscricao_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cpf text;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver CPF completo';
  END IF;

  -- Buscar CPF
  SELECT cpf INTO _cpf
  FROM inscricoes_publicas
  WHERE id = _inscricao_id;

  -- Registrar acesso ao CPF completo na auditoria
  INSERT INTO sensitive_data_audit (
    accessed_by,
    table_name,
    record_id,
    action_type,
    fields_accessed
  ) VALUES (
    auth.uid(),
    'inscricoes_publicas',
    _inscricao_id,
    'VIEW_SENSITIVE_FIELD',
    ARRAY['cpf_full']
  );

  RETURN _cpf;
END;
$$;