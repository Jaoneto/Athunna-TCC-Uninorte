-- Criar tabela para inscrições públicas em eventos
CREATE TABLE IF NOT EXISTS public.inscricoes_publicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  tipo_vinculo TEXT NOT NULL CHECK (tipo_vinculo IN ('aluno_interno', 'aluno_externo', 'docente', 'outro')),
  matricula TEXT,
  cpf TEXT,
  observacoes TEXT,
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.inscricoes_publicas ENABLE ROW LEVEL SECURITY;

-- Política para permitir inscrições públicas (qualquer um pode inserir)
CREATE POLICY "Qualquer pessoa pode se inscrever"
ON public.inscricoes_publicas
FOR INSERT
WITH CHECK (true);

-- Política para admins visualizarem todas as inscrições
CREATE POLICY "Admins podem ver todas inscrições"
ON public.inscricoes_publicas
FOR SELECT
USING (is_admin(auth.uid()));

-- Política para admins atualizarem inscrições
CREATE POLICY "Admins podem atualizar inscrições"
ON public.inscricoes_publicas
FOR UPDATE
USING (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_inscricoes_publicas_updated_at
BEFORE UPDATE ON public.inscricoes_publicas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_inscricoes_publicas_evento ON public.inscricoes_publicas(evento_id);
CREATE INDEX idx_inscricoes_publicas_email ON public.inscricoes_publicas(email);
CREATE INDEX idx_inscricoes_publicas_status ON public.inscricoes_publicas(status);