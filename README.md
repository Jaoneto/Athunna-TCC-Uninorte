<p align="center">
  <img src="public/athunna-logo.png" alt="Athunna Logo" width="200"/>
</p>

<h1 align="center">Athunna - Sistema de Gestão de Eventos Acadêmicos</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.11-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Supabase-2.79.0-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
</p>

---

## 🎓 Informações Acadêmicas

- **Instituição:** UNINORTE – Centro Universitário do Norte
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Tipo:** Trabalho de Conclusão de Curso (TCC)
- **Ano:** 2024/2025

---

## 👥 Autores

<table>
  <tr>
    <td align="center">
      <strong>Jesus Travessa de Melo Júnior</strong><br/>
      <a href="mailto:juniormelo884@gmail.com">juniormelo884@gmail.com</a>
    </td>
    <td align="center">
      <strong>João Tavares Meireles Neto</strong><br/>
      <a href="mailto:joaotavaresneto1997@gmail.com">joaotavaresneto1997@gmail.com</a>
    </td>
    <td align="center">
      <strong>Dionelson Siqueira Marinho Junior</strong><br/>
      <a href="mailto:djrmarinho@gmail.com">djrmarinho@gmail.com</a>
    </td>
  </tr>
</table>

---

## 👩‍🏫 Orientação e Avaliação

| Função | Nome | Titulação | Instituição | Email |
|--------|------|-----------|-------------|-------|
| **Orientadora** | Elda Nunes de Carvalho | Especialista | UNINORTE | 031200313@prof.uninorte.com.br |
| **Avaliadora** | Roneuane Grazielle Da Gama Araujo | Especialista em Eng. e Adm. de Banco de Dados Oracle | UNINORTE | roneuanegrazielle@gmail.com |

---

## 📋 Sobre o Projeto

O **Athunna** é uma plataforma web completa para gestão de eventos acadêmicos, desenvolvida como Trabalho de Conclusão de Curso (TCC). O sistema oferece uma solução integrada para instituições de ensino gerenciarem palestras, workshops, oficinas e outros eventos, com emissão automática de certificados digitais validados por QR Code.

### Problema Abordado

Instituições de ensino frequentemente enfrentam desafios na organização de eventos acadêmicos:
- Processos manuais de inscrição e controle de presença
- Dificuldade na emissão e validação de certificados
- Falta de métricas e indicadores de participação
- Comunicação fragmentada entre organizadores e participantes

### Solução Proposta

O Athunna centraliza todo o ciclo de vida de eventos acadêmicos em uma única plataforma, automatizando processos e fornecendo uma experiência moderna tanto para gestores quanto para participantes.

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura moderna de aplicação web Single Page Application (SPA) com backend serverless:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │  Tailwind   │  │   shadcn/ui (Radix)     │  │
│  │   Router    │  │    CSS      │  │   Component Library     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE ESTADO                            │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  TanStack Query │  │  Context    │  │   React Hook Form   │  │
│  │  (Server State) │  │  API (Auth) │  │   + Zod Validation  │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE SERVIÇOS                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase Client SDK                         │    │
│  │  • Authentication  • Database  • Storage  • Realtime    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Supabase)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PostgreSQL │  │    Edge     │  │      Storage            │  │
│  │  + RLS      │  │  Functions  │  │      Buckets            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.3.1 | Biblioteca para construção de interfaces |
| TypeScript | 5.5.3 | Superset JavaScript com tipagem estática |
| Vite | 5.4.1 | Build tool e dev server |
| Tailwind CSS | 3.4.11 | Framework CSS utilitário |
| shadcn/ui | - | Componentes acessíveis baseados em Radix UI |
| React Router | 6.26.2 | Roteamento client-side |
| TanStack Query | 5.56.2 | Gerenciamento de estado do servidor |
| React Hook Form | 7.53.0 | Gerenciamento de formulários |
| Zod | 3.23.8 | Validação de schemas |
| Recharts | 2.12.7 | Biblioteca de gráficos |
| Framer Motion | - | Animações (via Tailwind Animate) |

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Supabase | 2.79.0 | Backend-as-a-Service |
| PostgreSQL | 15+ | Banco de dados relacional |
| Edge Functions | Deno | Funções serverless |
| Row Level Security | - | Políticas de segurança no banco |

### Ferramentas Auxiliares

| Tecnologia | Descrição |
|------------|-----------|
| jsPDF | 3.0.3 | Geração de PDFs |
| html2canvas | 1.4.1 | Captura de elementos HTML |
| qrcode.react | 4.2.0 | Geração de QR Codes |
| date-fns | 3.6.0 | Manipulação de datas |
| Resend | - | Envio de emails transacionais |

---

## ✨ Funcionalidades

### Autenticação e Segurança
- ✅ Autenticação com email e senha
- ✅ Confirmação de email obrigatória
- ✅ Two-Factor Authentication (2FA) condicional
- ✅ Proteção contra brute force (bloqueio após 5 tentativas)
- ✅ CAPTCHA após 3 tentativas falhas
- ✅ Alertas de segurança por email
- ✅ Auditoria completa de logins
- ✅ Recuperação de senha

### Gestão de Eventos
- ✅ Criação e edição de eventos
- ✅ Tipos: Palestras, Workshops, Oficinas
- ✅ Controle de capacidade e vagas
- ✅ Modalidades: Presencial, Online, Híbrido
- ✅ Calendário visual de eventos
- ✅ QR Code para inscrições públicas

### Atividades
- ✅ Vinculação de atividades a eventos
- ✅ Controle de presença
- ✅ Carga horária configurável
- ✅ Informações de palestrante

### Certificados
- ✅ Emissão automática ao confirmar presença
- ✅ Templates customizáveis por instituição
- ✅ QR Code de validação embarcado
- ✅ Validação pública de certificados
- ✅ Download em PDF
- ✅ Revogação automática ao marcar ausência

### Notificações
- ✅ Confirmação de inscrição por email
- ✅ Lembretes automáticos (15, 10, 1 dia antes)
- ✅ Notificações in-app em tempo real
- ✅ Alertas de segurança

### Dashboard e Indicadores
- ✅ Métricas de eventos e participações
- ✅ Gráficos de evolução
- ✅ Ranking de participação
- ✅ Histórico de atividades

### Comunidade
- ✅ Posts colaborativos
- ✅ Upload de imagens
- ✅ Interação entre estudantes e professores

### Interface
- ✅ Design responsivo (mobile-first)
- ✅ Tema claro e escuro
- ✅ Acessibilidade (WCAG)
- ✅ Animações suaves

---

## 🔐 Segurança

### Row Level Security (RLS)

O sistema implementa políticas de segurança em nível de banco de dados:

```sql
-- Exemplo: Usuários só podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON usuarios FOR SELECT 
USING (auth.uid() = id);

-- Administradores têm acesso ampliado
CREATE POLICY "Admins can view all users" 
ON usuarios FOR SELECT 
USING (is_admin(auth.uid()));
```

### Auditoria

- **login_audit_log**: Registro de todas as tentativas de login
- **sensitive_data_audit**: Acesso a dados sensíveis (CPF, etc.)
- **profile_audit_log**: Mudanças de perfil e permissões

### Funções de Segurança

```sql
-- Verificação segura de admin (fail-safe)
CREATE FUNCTION is_admin_safe(_user_id uuid) 
RETURNS boolean AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE COALESCE(
      (SELECT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = 'admin'
      )), false
    )
  END
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|------------|
| **Administrador** | Acesso total: gestão de usuários, eventos, instituições, relatórios |
| **Professor** | Gestão dos próprios eventos, controle de presença, emissão de certificados |
| **Estudante** | Inscrição em eventos, visualização de certificados, participação na comunidade |

---

## 📁 Estrutura de Diretórios

```
athunna/
├── public/                     # Arquivos estáticos
│   ├── athunna-logo.png
│   └── favicon.png
├── src/
│   ├── assets/                 # Recursos da aplicação
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   └── student/            # Componentes específicos do estudante
│   ├── contexts/               # Context API (AuthContext)
│   ├── hooks/                  # Custom hooks
│   │   ├── useEvents.tsx
│   │   ├── useActivities.tsx
│   │   ├── useCertificates.tsx
│   │   └── useUserProfile.tsx
│   ├── integrations/
│   │   └── supabase/           # Configuração do Supabase
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/                    # Utilitários
│   ├── pages/                  # Páginas da aplicação
│   │   ├── student/            # Área do estudante
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Activities.tsx
│   │   └── ...
│   ├── App.tsx                 # Componente raiz e rotas
│   ├── main.tsx                # Ponto de entrada
│   └── index.css               # Estilos globais e design system
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── send-auth-email/
│   │   ├── send-event-reminders/
│   │   ├── generate-certificates/
│   │   └── ...
│   ├── migrations/             # Migrações do banco
│   └── config.toml             # Configuração do Supabase
├── tailwind.config.ts          # Configuração do Tailwind
├── vite.config.ts              # Configuração do Vite
└── package.json
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js >= 18.x
- npm ou yarn
- Conta no Supabase (para backend)

### Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/athunna.git
cd athunna
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

4. **Execute em modo de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:8080
```

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

---

## 📊 Modelo de Dados

### Principais Entidades

```
usuarios          → Perfis de usuário
eventos           → Eventos acadêmicos
atividades        → Atividades vinculadas a eventos
inscricoes_eventos → Inscrições de usuários em eventos
participacoes_atividades → Participações em atividades
certificados      → Certificados emitidos
instituicoes      → Instituições de ensino
notificacoes      → Notificações do sistema
community_posts   → Posts da comunidade
```

### Relacionamentos

- Um **evento** pertence a uma **instituição**
- Um **evento** tem várias **atividades**
- Um **usuário** pode se inscrever em vários **eventos**
- Um **certificado** está vinculado a um **usuário** e a um **evento/atividade**

---

## 🎨 Design System

O projeto utiliza um design system consistente definido em `src/index.css` e `tailwind.config.ts`:

### Cores Principais (HSL)
- **Primary**: `234 43% 59%` (#5D66D1 - Indigo Frost)
- **Background**: `230 33% 98%` (#F6F7FC)
- **Foreground**: Adaptativo para temas claro/escuro

### Temas
- **Administrativo**: Frosted Glass Premium (minimalista, sofisticado)
- **Estudante**: Editorial Page-Turning (limpo, moderno)

---

## 📧 Edge Functions

| Função | Descrição |
|--------|-----------|
| `send-auth-email` | Emails de confirmação e recuperação |
| `send-event-reminders` | Lembretes automáticos de eventos |
| `send-registration-notification` | Confirmação de inscrição |
| `send-security-alert` | Alertas de tentativas suspeitas |
| `send-admin-welcome-email` | Boas-vindas para novos admins |
| `generate-certificates` | Geração de certificados |
| `send-2fa-code` | Códigos de autenticação 2FA |
| `verify-2fa-code` | Verificação de códigos 2FA |
| `log-login-attempt` | Registro de tentativas de login |

---

## 📝 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e está disponível para fins acadêmicos e educacionais.

---

<p align="center">
  <strong>Athunna</strong> - Transformando a gestão de eventos acadêmicos
</p>
