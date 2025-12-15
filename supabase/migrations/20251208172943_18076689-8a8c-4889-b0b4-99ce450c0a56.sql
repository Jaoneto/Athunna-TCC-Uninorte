-- =============================================
-- ETAPA 1: Criar Funções de Segurança Reforçadas
-- =============================================

-- Função segura para verificar se usuário está autenticado
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.uid() IS NOT NULL, false)
$$;

-- Função segura para verificar admin com fallback seguro
CREATE OR REPLACE FUNCTION public.is_admin_safe(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE COALESCE(
      (SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = 'admin'
      )), false
    )
  END
$$;

-- =============================================
-- ETAPA 2: Políticas Reforçadas para Tabela usuarios
-- =============================================

-- Remover políticas antigas da tabela usuarios
DROP POLICY IF EXISTS "Users can view own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own profile " ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can view all profiles " ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own profile " ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile " ON public.usuarios;
DROP POLICY IF EXISTS "Require authentication for usuarios" ON public.usuarios;

-- Política RESTRICTIVE - requer autenticação para qualquer operação
CREATE POLICY "Require authentication for usuarios"
ON public.usuarios
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Políticas PERMISSIVE (funcionam APÓS a RESTRICTIVE)
CREATE POLICY "Users can view own profile"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.usuarios
FOR SELECT
TO authenticated
USING (is_admin_safe(auth.uid()));

CREATE POLICY "Users can insert own profile"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- =============================================
-- ETAPA 3: Políticas Reforçadas para Tabela inscricoes_publicas
-- =============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Qualquer pessoa pode se inscrever" ON public.inscricoes_publicas;
DROP POLICY IF EXISTS "Admins podem ver todas inscrições" ON public.inscricoes_publicas;
DROP POLICY IF EXISTS "Admins podem atualizar inscrições" ON public.inscricoes_publicas;
DROP POLICY IF EXISTS "Anyone can register" ON public.inscricoes_publicas;
DROP POLICY IF EXISTS "Only authenticated admins can view registrations" ON public.inscricoes_publicas;
DROP POLICY IF EXISTS "Only authenticated admins can update registrations" ON public.inscricoes_publicas;

-- INSERT permanece público (necessário para formulário de inscrição pública)
CREATE POLICY "Anyone can register publicly"
ON public.inscricoes_publicas
FOR INSERT
TO public
WITH CHECK (true);

-- SELECT restrito a admins autenticados com verificação dupla
CREATE POLICY "Only authenticated admins can view registrations"
ON public.inscricoes_publicas
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin_safe(auth.uid())
);

-- UPDATE restrito a admins autenticados com verificação dupla
CREATE POLICY "Only authenticated admins can update registrations"
ON public.inscricoes_publicas
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin_safe(auth.uid())
);