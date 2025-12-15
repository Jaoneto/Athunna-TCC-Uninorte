-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURANÇA
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_eventos ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÕES AUXILIARES PARA RLS
-- =============================================================================

-- Função para obter o tipo de perfil do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.tipo_perfil AS $$
  SELECT tipo_perfil FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_perfil = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função para verificar se o usuário pode consultar (admin ou consulta)
CREATE OR REPLACE FUNCTION public.can_read_all()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_perfil IN ('admin', 'consulta')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função para verificar se o usuário é estudante
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_perfil = 'estudante'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- POLÍTICAS RLS - INSTITUIÇÕES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em instituições" ON public.instituicoes
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler instituições" ON public.instituicoes
FOR SELECT USING (public.can_read_all());

-- Estudante: apenas leitura (instituições públicas)
CREATE POLICY "Estudante pode ler instituições ativas" ON public.instituicoes
FOR SELECT USING (ativo = true);

-- =============================================================================
-- POLÍTICAS RLS - UNIDADES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em unidades" ON public.unidades
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler unidades" ON public.unidades
FOR SELECT USING (public.can_read_all());

-- Estudante: apenas leitura (unidades ativas)
CREATE POLICY "Estudante pode ler unidades ativas" ON public.unidades
FOR SELECT USING (ativo = true);

-- =============================================================================
-- POLÍTICAS RLS - USUÁRIOS
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em usuários" ON public.usuarios
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler usuários" ON public.usuarios
FOR SELECT USING (public.can_read_all());

-- Usuário: pode ler e atualizar seus próprios dados
CREATE POLICY "Usuário pode ver e editar próprio perfil" ON public.usuarios
FOR ALL USING (id = auth.uid());

-- Estudantes: podem ver outros estudantes (para funcionalidades sociais)
CREATE POLICY "Estudante pode ver outros estudantes" ON public.usuarios
FOR SELECT USING (
  public.is_student() AND tipo_perfil = 'estudante' AND ativo = true
);

-- =============================================================================
-- POLÍTICAS RLS - EVENTOS
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em eventos" ON public.eventos
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler eventos" ON public.eventos
FOR SELECT USING (public.can_read_all());

-- Criador do evento: pode editar seus próprios eventos
CREATE POLICY "Criador pode editar seus eventos" ON public.eventos
FOR ALL USING (criado_por = auth.uid());

-- Estudante: apenas leitura de eventos ativos
CREATE POLICY "Estudante pode ler eventos ativos" ON public.eventos
FOR SELECT USING (ativo = true);

-- =============================================================================
-- POLÍTICAS RLS - CRONOGRAMA
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em cronograma" ON public.cronograma
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler cronograma" ON public.cronograma
FOR SELECT USING (public.can_read_all());

-- Responsável: pode editar cronogramas que é responsável
CREATE POLICY "Responsável pode editar cronograma" ON public.cronograma
FOR ALL USING (responsavel_id = auth.uid());

-- Criador do evento: pode editar cronograma dos seus eventos
CREATE POLICY "Criador evento pode editar cronograma" ON public.cronograma
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.eventos 
    WHERE id = cronograma.evento_id AND criado_por = auth.uid()
  )
);

-- Estudante: leitura de cronogramas de eventos ativos
CREATE POLICY "Estudante pode ler cronograma eventos ativos" ON public.cronograma
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.eventos 
    WHERE id = cronograma.evento_id AND ativo = true
  )
);

-- =============================================================================
-- POLÍTICAS RLS - OFICINAS
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em oficinas" ON public.oficinas
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler oficinas" ON public.oficinas
FOR SELECT USING (public.can_read_all());

-- Responsável: pode editar suas oficinas
CREATE POLICY "Responsável pode editar suas oficinas" ON public.oficinas
FOR ALL USING (responsavel_id = auth.uid());

-- Estudante: leitura de oficinas ativas
CREATE POLICY "Estudante pode ler oficinas ativas" ON public.oficinas
FOR SELECT USING (ativo = true);

-- =============================================================================
-- POLÍTICAS RLS - ATIVIDADES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em atividades" ON public.atividades
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler atividades" ON public.atividades
FOR SELECT USING (public.can_read_all());

-- Responsável: pode editar suas atividades
CREATE POLICY "Responsável pode editar suas atividades" ON public.atividades
FOR ALL USING (responsavel_id = auth.uid());

-- Estudante: leitura de atividades ativas
CREATE POLICY "Estudante pode ler atividades ativas" ON public.atividades
FOR SELECT USING (ativo = true);

-- =============================================================================
-- POLÍTICAS RLS - PARTICIPANTES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em participantes" ON public.participantes
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler participantes" ON public.participantes
FOR SELECT USING (public.can_read_all());

-- Usuário: pode ver e editar suas próprias participações
CREATE POLICY "Usuário pode ver suas participações" ON public.participantes
FOR ALL USING (usuario_id = auth.uid());

-- Criador do evento: pode ver/editar participantes dos seus eventos
CREATE POLICY "Criador evento pode gerenciar participantes" ON public.participantes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.eventos 
    WHERE id = participantes.evento_id AND criado_por = auth.uid()
  )
);

-- Estudante: pode se inscrever em eventos (apenas inserção com seu user_id)
CREATE POLICY "Estudante pode se inscrever" ON public.participantes
FOR INSERT WITH CHECK (
  public.is_student() AND usuario_id = auth.uid()
);

-- =============================================================================
-- POLÍTICAS RLS - INDICADORES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em indicadores" ON public.indicadores
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler indicadores" ON public.indicadores
FOR SELECT USING (public.can_read_all());

-- =============================================================================
-- POLÍTICAS RLS - RELATÓRIOS
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em relatórios" ON public.relatorios
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura de relatórios publicados
CREATE POLICY "Consulta pode ler relatórios publicados" ON public.relatorios
FOR SELECT USING (
  public.can_read_all() AND status = 'publicado'
);

-- Autor: pode editar seus próprios relatórios
CREATE POLICY "Autor pode editar seus relatórios" ON public.relatorios
FOR ALL USING (autor_id = auth.uid());

-- =============================================================================
-- POLÍTICAS RLS - HISTÓRICO CERTIFICADOS
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em certificados" ON public.historico_certificados
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler certificados" ON public.historico_certificados
FOR SELECT USING (public.can_read_all());

-- Usuário: pode ver seus próprios certificados
CREATE POLICY "Usuário pode ver seus certificados" ON public.historico_certificados
FOR SELECT USING (usuario_id = auth.uid());

-- =============================================================================
-- POLÍTICAS RLS - AVALIAÇÕES
-- =============================================================================

-- Admin: acesso total
CREATE POLICY "Admin pode fazer tudo em avaliações" ON public.avaliacoes_eventos
FOR ALL USING (public.is_admin());

-- Consulta: apenas leitura
CREATE POLICY "Consulta pode ler avaliações" ON public.avaliacoes_eventos
FOR SELECT USING (public.can_read_all());

-- Usuário: pode criar e editar suas próprias avaliações
CREATE POLICY "Usuário pode gerenciar suas avaliações" ON public.avaliacoes_eventos
FOR ALL USING (usuario_id = auth.uid());

-- Criador do evento: pode ver avaliações dos seus eventos
CREATE POLICY "Criador evento pode ver avaliações" ON public.avaliacoes_eventos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.eventos 
    WHERE id = avaliacoes_eventos.evento_id AND criado_por = auth.uid()
  )
);