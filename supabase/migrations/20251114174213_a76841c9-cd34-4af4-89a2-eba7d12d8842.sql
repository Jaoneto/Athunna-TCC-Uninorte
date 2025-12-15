-- Criar tabela de auditoria para mudanças de perfil
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_role app_role NOT NULL,
  new_role app_role NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('promote', 'demote', 'create')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy para admins visualizarem o log
CREATE POLICY "Admins can view audit log"
ON public.profile_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- Policy para sistema inserir no log
CREATE POLICY "Admins can insert audit log"
ON public.profile_audit_log
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Adicionar índices para melhor performance
CREATE INDEX idx_profile_audit_log_user_id ON public.profile_audit_log(user_id);
CREATE INDEX idx_profile_audit_log_changed_by ON public.profile_audit_log(changed_by);
CREATE INDEX idx_profile_audit_log_created_at ON public.profile_audit_log(created_at DESC);

-- Comentários na tabela
COMMENT ON TABLE public.profile_audit_log IS 'Log de auditoria para mudanças de perfil de usuários';
COMMENT ON COLUMN public.profile_audit_log.user_id IS 'Usuário que teve o perfil alterado';
COMMENT ON COLUMN public.profile_audit_log.changed_by IS 'Usuário que fez a alteração';
COMMENT ON COLUMN public.profile_audit_log.action_type IS 'Tipo de ação: promote (promover), demote (rebaixar), create (criar)';
COMMENT ON COLUMN public.profile_audit_log.previous_role IS 'Perfil anterior do usuário';
COMMENT ON COLUMN public.profile_audit_log.new_role IS 'Novo perfil do usuário';