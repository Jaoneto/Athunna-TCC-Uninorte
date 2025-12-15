-- Enable Realtime for notificacoes and community_posts tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;

-- Performance indexes for eventos table
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel_id ON public.eventos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON public.eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON public.eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_instituicao_id ON public.eventos(instituicao_id);

-- Performance indexes for atividades table
CREATE INDEX IF NOT EXISTS idx_atividades_evento_id ON public.atividades(evento_id);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON public.atividades(tipo);
CREATE INDEX IF NOT EXISTS idx_atividades_data_inicio ON public.atividades(data_inicio);

-- Performance indexes for notificacoes table
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at DESC);

-- Performance indexes for certificados table
CREATE INDEX IF NOT EXISTS idx_certificados_usuario_id ON public.certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_certificados_evento_id ON public.certificados(evento_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo_verificacao ON public.certificados(codigo_verificacao);

-- Performance indexes for community_posts table
CREATE INDEX IF NOT EXISTS idx_community_posts_usuario_id ON public.community_posts(usuario_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tipo ON public.community_posts(tipo);