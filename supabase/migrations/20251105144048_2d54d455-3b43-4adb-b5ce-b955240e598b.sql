-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'estudante');

-- Create usuarios table (user profiles)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo_perfil app_role NOT NULL,
  curso TEXT,
  semestre TEXT,
  bio TEXT,
  avatar_url TEXT,
  telefone TEXT,
  data_nascimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create instituicoes table
CREATE TABLE public.instituicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  sigla TEXT,
  tipo TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  contato_email TEXT,
  contato_telefone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eventos table
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL, -- workshop, palestra, seminario, etc
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  capacidade_maxima INTEGER,
  vagas_disponiveis INTEGER,
  status TEXT DEFAULT 'ativo', -- ativo, cancelado, finalizado
  imagem_url TEXT,
  responsavel_id UUID REFERENCES public.usuarios(id),
  instituicao_id UUID REFERENCES public.instituicoes(id),
  requisitos TEXT,
  publico_alvo TEXT,
  modalidade TEXT DEFAULT 'presencial', -- presencial, online, hibrido
  link_online TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create atividades table
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT, -- palestra, oficina, mesa-redonda, etc
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  palestrante TEXT,
  palestrante_bio TEXT,
  capacidade_maxima INTEGER,
  vagas_disponiveis INTEGER,
  carga_horaria INTEGER, -- em horas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inscricoes_eventos table (event registrations)
CREATE TABLE public.inscricoes_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmada', -- confirmada, cancelada, em_espera
  data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_cancelamento TIMESTAMP WITH TIME ZONE,
  presenca_confirmada BOOLEAN DEFAULT FALSE,
  certificado_emitido BOOLEAN DEFAULT FALSE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- Create participacoes_atividades table
CREATE TABLE public.participacoes_atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  atividade_id UUID REFERENCES public.atividades(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  presenca BOOLEAN DEFAULT FALSE,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  feedback TEXT,
  certificado_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(atividade_id, usuario_id)
);

-- Create certificados table
CREATE TABLE public.certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
  atividade_id UUID REFERENCES public.atividades(id) ON DELETE CASCADE,
  codigo_verificacao TEXT UNIQUE NOT NULL,
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url_pdf TEXT,
  carga_horaria INTEGER,
  tipo TEXT, -- participacao, palestrante, organizacao
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notificacoes table
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT, -- info, success, warning, error
  lida BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participacoes_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role from usuarios table
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tipo_perfil FROM public.usuarios WHERE id = _user_id
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tipo_perfil = 'admin' FROM public.usuarios WHERE id = _user_id
$$;

-- RLS Policies for usuarios table
CREATE POLICY "Users can view all profiles"
  ON public.usuarios FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles table
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for instituicoes
CREATE POLICY "Everyone can view institutions"
  ON public.instituicoes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage institutions"
  ON public.instituicoes FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for eventos
CREATE POLICY "Everyone can view active events"
  ON public.eventos FOR SELECT
  USING (true);

CREATE POLICY "Admins and professors can create events"
  ON public.eventos FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.get_user_role(auth.uid()) = 'professor'
  );

CREATE POLICY "Admins and event owners can update events"
  ON public.eventos FOR UPDATE
  USING (
    public.is_admin(auth.uid()) OR 
    responsavel_id = auth.uid()
  );

CREATE POLICY "Admins can delete events"
  ON public.eventos FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for atividades
CREATE POLICY "Everyone can view activities"
  ON public.atividades FOR SELECT
  USING (true);

CREATE POLICY "Admins and professors can manage activities"
  ON public.atividades FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.get_user_role(auth.uid()) = 'professor'
  );

-- RLS Policies for inscricoes_eventos
CREATE POLICY "Users can view own registrations"
  ON public.inscricoes_eventos FOR SELECT
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own registrations"
  ON public.inscricoes_eventos FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update own registrations"
  ON public.inscricoes_eventos FOR UPDATE
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can delete own registrations"
  ON public.inscricoes_eventos FOR DELETE
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

-- RLS Policies for participacoes_atividades
CREATE POLICY "Users can view own participations"
  ON public.participacoes_atividades FOR SELECT
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own participations"
  ON public.participacoes_atividades FOR ALL
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

-- RLS Policies for certificados
CREATE POLICY "Users can view own certificates"
  ON public.certificados FOR SELECT
  USING (usuario_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "System can create certificates"
  ON public.certificados FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for notificacoes
CREATE POLICY "Users can view own notifications"
  ON public.notificacoes FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notificacoes FOR UPDATE
  USING (usuario_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) OR usuario_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome_completo, email, tipo_perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Novo Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo_perfil')::app_role, 'estudante')
  );
  
  -- Add role to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'tipo_perfil')::app_role, 'estudante')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instituicoes_updated_at
  BEFORE UPDATE ON public.instituicoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inscricoes_eventos_updated_at
  BEFORE UPDATE ON public.inscricoes_eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participacoes_atividades_updated_at
  BEFORE UPDATE ON public.participacoes_atividades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();