-- =============================================================================
-- SISTEMA ATHUNNA - BANCO DE DADOS COMPLETO
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TIPOS E ENUMS
-- =============================================================================

-- Tipo de perfil de usuário
CREATE TYPE public.tipo_perfil AS ENUM ('admin', 'consulta', 'estudante');

-- Tipo de evento
CREATE TYPE public.tipo_evento AS ENUM ('oficina', 'minicurso', 'palestra', 'workshop', 'atividade', 'outro');

-- Tipo de vínculo do participante
CREATE TYPE public.tipo_vinculo AS ENUM ('estudante', 'voluntario', 'beneficiario', 'docente', 'servidor', 'outro');

-- Gênero
CREATE TYPE public.genero AS ENUM ('masculino', 'feminino', 'outro', 'nao_informado');

-- Tipo de relatório
CREATE TYPE public.tipo_relatorio AS ENUM ('mensal', 'trimestral', 'semestral', 'anual', 'especial');

-- Divisão para relatórios
CREATE TYPE public.divisao_relatorio AS ENUM ('docentes', 'alunos_internos', 'alunos_externos', 'comunidade', 'geral');

-- Status do relatório
CREATE TYPE public.status_relatorio AS ENUM ('rascunho', 'em_revisao', 'publicado', 'arquivado');

-- Tipo de atividade
CREATE TYPE public.tipo_atividade AS ENUM ('oficina', 'palestra', 'roda_conversa', 'workshop', 'curso', 'seminario', 'outro');

-- =============================================================================
-- TABELA: INSTITUIÇÕES
-- =============================================================================

CREATE TABLE public.instituicoes (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    responsavel TEXT,
    email TEXT,
    telefone TEXT,
    cnpj TEXT UNIQUE,
    logo TEXT,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABELA: UNIDADES
-- =============================================================================

CREATE TABLE public.unidades (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    instituicao_id UUID NOT NULL REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    endereco TEXT,
    bairro TEXT,
    municipio TEXT,
    estado TEXT,
    cep TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABELA: PERFIS DE USUÁRIO (integração com auth.users)
-- =============================================================================

CREATE TABLE public.usuarios (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    foto TEXT,
    tipo_perfil public.tipo_perfil NOT NULL DEFAULT 'estudante',
    telefone TEXT,
    data_nascimento DATE,
    genero public.genero,
    curso TEXT,
    semestre TEXT,
    registro_academico TEXT,
    bio TEXT,
    unidade_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABELA: EVENTOS
-- =============================================================================

CREATE TABLE public.eventos (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    local TEXT,
    tipo_evento public.tipo_evento NOT NULL DEFAULT 'outro',
    unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    participantes_max INTEGER,
    participantes_atuais INTEGER DEFAULT 0,
    valor_inscricao DECIMAL(10,2) DEFAULT 0,
    anexos JSONB,
    tags TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABELA: CRONOGRAMA
-- =============================================================================

CREATE TABLE public.cronograma (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    local TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT cronograma_horario_valido CHECK (hora_inicio < hora_fim)
);

-- =============================================================================
-- TABELA: OFICINAS
-- =============================================================================

CREATE TABLE public.oficinas (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    responsavel_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    duracao_horas INTEGER NOT NULL DEFAULT 1,
    area_tematica TEXT,
    objetivos TEXT,
    pre_requisitos TEXT,
    materiais_necessarios TEXT,
    certificado_disponivel BOOLEAN DEFAULT true,
    horas_complementares INTEGER DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT oficinas_duracao_positiva CHECK (duracao_horas > 0)
);

-- =============================================================================
-- TABELA: ATIVIDADES
-- =============================================================================

CREATE TABLE public.atividades (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo public.tipo_atividade NOT NULL DEFAULT 'outro',
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    participantes_max INTEGER,
    participantes_atuais INTEGER DEFAULT 0,
    duracao_minutos INTEGER DEFAULT 60,
    local TEXT,
    recursos_necessarios TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT atividades_participantes_validos CHECK (participantes_atuais <= participantes_max),
    CONSTRAINT atividades_duracao_positiva CHECK (duracao_minutos > 0)
);

-- =============================================================================
-- TABELA: PARTICIPANTES
-- =============================================================================

CREATE TABLE public.participantes (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento DATE,
    email TEXT NOT NULL,
    telefone TEXT,
    genero public.genero,
    tipo_vinculo public.tipo_vinculo NOT NULL DEFAULT 'estudante',
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    presenca BOOLEAN DEFAULT false,
    data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    avaliacao_evento INTEGER,
    comentario_avaliacao TEXT,
    certificado_emitido BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT participantes_avaliacao_valida CHECK (avaliacao_evento IS NULL OR (avaliacao_evento >= 1 AND avaliacao_evento <= 5)),
    CONSTRAINT participantes_email_evento_unique UNIQUE (email, evento_id)
);

-- =============================================================================
-- TABELA: INDICADORES
-- =============================================================================

CREATE TABLE public.indicadores (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    referencia_mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    alunos_envolvidos INTEGER DEFAULT 0,
    docentes_envolvidos INTEGER DEFAULT 0,
    pessoas_beneficiadas INTEGER DEFAULT 0,
    atendimentos INTEGER DEFAULT 0,
    eventos_realizados INTEGER DEFAULT 0,
    horas_atividades INTEGER DEFAULT 0,
    evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT indicadores_mes_valido CHECK (referencia_mes >= 1 AND referencia_mes <= 12),
    CONSTRAINT indicadores_ano_valido CHECK (ano >= 2020),
    CONSTRAINT indicadores_valores_positivos CHECK (
        alunos_envolvidos >= 0 AND 
        docentes_envolvidos >= 0 AND 
        pessoas_beneficiadas >= 0 AND 
        atendimentos >= 0 AND
        eventos_realizados >= 0 AND
        horas_atividades >= 0
    )
);

-- =============================================================================
-- TABELA: RELATÓRIOS
-- =============================================================================

CREATE TABLE public.relatorios (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo public.tipo_relatorio NOT NULL,
    divisao public.divisao_relatorio NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    status public.status_relatorio NOT NULL DEFAULT 'rascunho',
    arquivo_url TEXT,
    resumo_executivo TEXT,
    dados_json JSONB,
    template_usado TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT relatorios_periodo_valido CHECK (periodo_inicio <= periodo_fim)
);

-- =============================================================================
-- TABELA: HISTÓRICO DE CERTIFICADOS
-- =============================================================================

CREATE TABLE public.historico_certificados (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    participante_id UUID NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    certificado_url TEXT,
    codigo_verificacao TEXT UNIQUE,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    validade DATE,
    horas_complementares INTEGER DEFAULT 0,
    template_usado TEXT,
    dados_certificado JSONB,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT certificados_horas_positivas CHECK (horas_complementares >= 0)
);

-- =============================================================================
-- TABELA: AVALIAÇÕES DOS EVENTOS
-- =============================================================================

CREATE TABLE public.avaliacoes_eventos (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    nota_geral INTEGER NOT NULL,
    nota_organizacao INTEGER,
    nota_conteudo INTEGER,
    nota_instrutor INTEGER,
    nota_infraestrutura INTEGER,
    comentario TEXT,
    sugestoes TEXT,
    recomendaria BOOLEAN,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT avaliacoes_notas_validas CHECK (
        nota_geral >= 1 AND nota_geral <= 5 AND
        (nota_organizacao IS NULL OR (nota_organizacao >= 1 AND nota_organizacao <= 5)) AND
        (nota_conteudo IS NULL OR (nota_conteudo >= 1 AND nota_conteudo <= 5)) AND
        (nota_instrutor IS NULL OR (nota_instrutor >= 1 AND nota_instrutor <= 5)) AND
        (nota_infraestrutura IS NULL OR (nota_infraestrutura >= 1 AND nota_infraestrutura <= 5))
    ),
    CONSTRAINT avaliacoes_participante_evento_unique UNIQUE (participante_id, evento_id)
);

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para consultas frequentes
CREATE INDEX idx_usuarios_tipo_perfil ON public.usuarios(tipo_perfil);
CREATE INDEX idx_usuarios_ativo ON public.usuarios(ativo);
CREATE INDEX idx_eventos_data_inicio ON public.eventos(data_inicio);
CREATE INDEX idx_eventos_tipo_evento ON public.eventos(tipo_evento);
CREATE INDEX idx_eventos_unidade_id ON public.eventos(unidade_id);
CREATE INDEX idx_eventos_criado_por ON public.eventos(criado_por);
CREATE INDEX idx_participantes_evento_id ON public.participantes(evento_id);
CREATE INDEX idx_participantes_email ON public.participantes(email);
CREATE INDEX idx_participantes_usuario_id ON public.participantes(usuario_id);
CREATE INDEX idx_cronograma_evento_data ON public.cronograma(evento_id, data);
CREATE INDEX idx_indicadores_mes_ano ON public.indicadores(ano, referencia_mes);
CREATE INDEX idx_relatorios_autor_status ON public.relatorios(autor_id, status);
CREATE INDEX idx_certificados_participante ON public.historico_certificados(participante_id);
CREATE INDEX idx_certificados_codigo ON public.historico_certificados(codigo_verificacao);
CREATE INDEX idx_avaliacoes_evento ON public.avaliacoes_eventos(evento_id);

-- =============================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- =============================================================================

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas as tabelas
CREATE TRIGGER update_instituicoes_updated_at BEFORE UPDATE ON public.instituicoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cronograma_updated_at BEFORE UPDATE ON public.cronograma FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_oficinas_updated_at BEFORE UPDATE ON public.oficinas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_atividades_updated_at BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_participantes_updated_at BEFORE UPDATE ON public.participantes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_indicadores_updated_at BEFORE UPDATE ON public.indicadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_relatorios_updated_at BEFORE UPDATE ON public.relatorios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificados_updated_at BEFORE UPDATE ON public.historico_certificados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();