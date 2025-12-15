-- Tabela de auditoria de tentativas de login
CREATE TABLE public.login_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempt_count INTEGER DEFAULT 1,
  ip_address TEXT,
  user_agent TEXT,
  failure_reason TEXT,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_login_audit_email ON public.login_audit_log(email);
CREATE INDEX idx_login_audit_created_at ON public.login_audit_log(created_at DESC);
CREATE INDEX idx_login_audit_success ON public.login_audit_log(success);

-- Enable RLS
ALTER TABLE public.login_audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem visualizar logs de auditoria
CREATE POLICY "Admins can view login audit logs"
ON public.login_audit_log
FOR SELECT
USING (is_admin_safe(auth.uid()));

-- Sistema pode inserir logs (via edge function)
CREATE POLICY "System can insert login audit logs"
ON public.login_audit_log
FOR INSERT
WITH CHECK (true);

-- Tabela para códigos 2FA temporários
CREATE TABLE public.two_factor_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_2fa_email ON public.two_factor_codes(email);
CREATE INDEX idx_2fa_expires ON public.two_factor_codes(expires_at);

-- Enable RLS
ALTER TABLE public.two_factor_codes ENABLE ROW LEVEL SECURITY;

-- Sistema pode gerenciar códigos 2FA
CREATE POLICY "System can manage 2fa codes"
ON public.two_factor_codes
FOR ALL
WITH CHECK (true);

-- Limpar códigos expirados automaticamente (função)
CREATE OR REPLACE FUNCTION public.cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.two_factor_codes
  WHERE expires_at < now() OR used = true;
END;
$$;