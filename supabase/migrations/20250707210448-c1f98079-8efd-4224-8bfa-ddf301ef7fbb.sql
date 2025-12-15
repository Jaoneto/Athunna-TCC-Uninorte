-- =============================================================================
-- FUNÇÕES AUXILIARES E TRIGGERS DO SISTEMA
-- =============================================================================

-- Função para atualizar contador de participantes em eventos
CREATE OR REPLACE FUNCTION public.update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.eventos 
    SET participantes_atuais = participantes_atuais + 1 
    WHERE id = NEW.evento_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.eventos 
    SET participantes_atuais = GREATEST(participantes_atuais - 1, 0) 
    WHERE id = OLD.evento_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de participantes
CREATE TRIGGER trigger_update_event_participants
  AFTER INSERT OR DELETE ON public.participantes
  FOR EACH ROW EXECUTE FUNCTION public.update_event_participants_count();

-- Função para gerar código de verificação de certificado
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_verificacao IS NULL THEN
    NEW.codigo_verificacao := 'CERT-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código de verificação automaticamente
CREATE TRIGGER trigger_generate_certificate_code
  BEFORE INSERT ON public.historico_certificados
  FOR EACH ROW EXECUTE FUNCTION public.generate_certificate_code();

-- Função para criar perfil de usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome_completo, email, tipo_perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo_perfil')::public.tipo_perfil, 'estudante')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- FUNÇÕES PARA ESTATÍSTICAS E RELATÓRIOS
-- =============================================================================

-- Função para calcular estatísticas mensais
CREATE OR REPLACE FUNCTION public.calcular_estatisticas_mes(
  p_mes INTEGER,
  p_ano INTEGER,
  p_unidade_id UUID DEFAULT NULL
)
RETURNS TABLE (
  eventos_realizados BIGINT,
  total_participantes BIGINT,
  total_certificados BIGINT,
  horas_atividades BIGINT,
  media_avaliacao NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT e.id) as eventos_realizados,
    COUNT(DISTINCT p.id) as total_participantes,
    COUNT(DISTINCT hc.id) as total_certificados,
    COALESCE(SUM(o.duracao_horas), 0) as horas_atividades,
    ROUND(AVG(ae.nota_geral), 2) as media_avaliacao
  FROM public.eventos e
  LEFT JOIN public.participantes p ON e.id = p.evento_id
  LEFT JOIN public.oficinas o ON e.id = o.evento_id
  LEFT JOIN public.historico_certificados hc ON e.id = hc.evento_id
  LEFT JOIN public.avaliacoes_eventos ae ON e.id = ae.evento_id
  WHERE 
    EXTRACT(MONTH FROM e.data_inicio) = p_mes
    AND EXTRACT(YEAR FROM e.data_inicio) = p_ano
    AND (p_unidade_id IS NULL OR e.unidade_id = p_unidade_id)
    AND e.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar eventos disponíveis para estudantes
CREATE OR REPLACE FUNCTION public.get_available_events(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  tipo_evento public.tipo_evento,
  participantes_max INTEGER,
  participantes_atuais INTEGER,
  vagas_disponiveis INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.titulo,
    e.descricao,
    e.data_inicio,
    e.data_fim,
    e.local,
    e.tipo_evento,
    e.participantes_max,
    e.participantes_atuais,
    GREATEST(COALESCE(e.participantes_max, 999) - COALESCE(e.participantes_atuais, 0), 0) as vagas_disponiveis
  FROM public.eventos e
  WHERE 
    e.ativo = true
    AND e.data_inicio > NOW()
    AND (e.participantes_max IS NULL OR e.participantes_atuais < e.participantes_max)
  ORDER BY e.data_inicio ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DADOS INICIAIS DO SISTEMA
-- =============================================================================

-- Inserir instituição padrão
INSERT INTO public.instituicoes (
  nome, 
  responsavel, 
  email, 
  telefone, 
  descricao
) VALUES (
  'Athunna Educacional',
  'Administrador do Sistema',
  'admin@athunna.edu.br',
  '(11) 9999-9999',
  'Plataforma de gestão educacional e eventos acadêmicos'
) ON CONFLICT DO NOTHING;

-- Inserir unidade padrão
INSERT INTO public.unidades (
  nome,
  instituicao_id,
  endereco,
  bairro,
  municipio,
  estado,
  cep
) VALUES (
  'Campus Principal',
  (SELECT id FROM public.instituicoes LIMIT 1),
  'Rua da Educação, 123',
  'Centro',
  'São Paulo',
  'SP',
  '01000-000'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- FUNÇÕES PARA INTEGRAÇÃO COM A APLICAÇÃO
-- =============================================================================

-- Função para inscrever estudante em evento
CREATE OR REPLACE FUNCTION public.inscrever_em_evento(
  p_evento_id UUID,
  p_usuario_id UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  v_evento public.eventos%ROWTYPE;
  v_usuario public.usuarios%ROWTYPE;
  v_participante_id UUID;
  v_result JSON;
BEGIN
  -- Verificar se o evento existe e está ativo
  SELECT * INTO v_evento FROM public.eventos WHERE id = p_evento_id AND ativo = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Evento não encontrado ou inativo');
  END IF;

  -- Verificar se ainda há vagas
  IF v_evento.participantes_max IS NOT NULL AND v_evento.participantes_atuais >= v_evento.participantes_max THEN
    RETURN json_build_object('success', false, 'message', 'Evento lotado');
  END IF;

  -- Verificar se o usuário existe
  SELECT * INTO v_usuario FROM public.usuarios WHERE id = p_usuario_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Usuário não encontrado');
  END IF;

  -- Verificar se já está inscrito
  IF EXISTS (SELECT 1 FROM public.participantes WHERE evento_id = p_evento_id AND usuario_id = p_usuario_id) THEN
    RETURN json_build_object('success', false, 'message', 'Usuário já inscrito neste evento');
  END IF;

  -- Realizar inscrição
  INSERT INTO public.participantes (
    nome,
    email,
    telefone,
    genero,
    tipo_vinculo,
    evento_id,
    usuario_id,
    data_inscricao
  ) VALUES (
    v_usuario.nome_completo,
    v_usuario.email,
    v_usuario.telefone,
    v_usuario.genero,
    'estudante',
    p_evento_id,
    p_usuario_id,
    NOW()
  ) RETURNING id INTO v_participante_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Inscrição realizada com sucesso',
    'participante_id', v_participante_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cancelar inscrição
CREATE OR REPLACE FUNCTION public.cancelar_inscricao(
  p_evento_id UUID,
  p_usuario_id UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  v_participante_id UUID;
BEGIN
  -- Verificar se a inscrição existe
  SELECT id INTO v_participante_id 
  FROM public.participantes 
  WHERE evento_id = p_evento_id AND usuario_id = p_usuario_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Inscrição não encontrada');
  END IF;

  -- Cancelar inscrição
  DELETE FROM public.participantes WHERE id = v_participante_id;

  RETURN json_build_object('success', true, 'message', 'Inscrição cancelada com sucesso');

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;