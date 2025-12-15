# Sistema de Roles e Permissões - Athunna

## 📋 Visão Geral

O sistema Athunna implementa um robusto sistema de controle de acesso baseado em três perfis de usuário: **Admin**, **Professor** e **Estudante**. Cada perfil possui permissões e áreas de acesso específicas, garantindo segurança e separação adequada de responsabilidades.

## 👥 Perfis de Usuário

### 🔷 ADMIN (Administrador/Instituição)

**Acesso Completo ao Sistema**

#### Rotas Acessíveis:
- `/` - Painel Administrativo completo
- `/student` - Visualização do ambiente estudantil (via Environment Switcher)

#### Permissões:
- ✅ Visualizar e gerenciar todos os eventos (independente do responsável)
- ✅ Criar, editar e excluir eventos
- ✅ Cadastrar e gerenciar instituições
- ✅ Visualizar indicadores gerais do sistema
- ✅ Acessar relatórios completos
- ✅ Gerenciar todos os participantes
- ✅ Marcar presença em qualquer evento
- ✅ Emitir certificados para qualquer evento
- ✅ Gerenciar usuários e roles
- ✅ Alternar entre ambiente Admin e Estudante

#### Menu Sidebar (Admin):
- Painel
- Cronograma
- Cadastrar Evento
- Eventos Anteriores
- Participantes
- Lista Participantes
- Oficinas
- Workshops
- Palestras
- **Indicadores** (exclusivo Admin)
- Relatórios
- Avaliações
- Comunidade
- **Instituições** (exclusivo Admin)

---

### 🔷 PROFESSOR

**Gerenciamento de Próprios Eventos**

#### Rotas Acessíveis:
- `/` - Painel Administrativo (com filtros aplicados)
- ❌ `/student` - Bloqueado

#### Permissões:
- ✅ Criar eventos (responsável será o próprio professor)
- ✅ Editar e excluir apenas seus próprios eventos
- ✅ Visualizar todos os eventos (pode ver eventos de outros, mas não editar)
- ✅ Gerenciar atividades (oficinas/workshops/palestras) dos seus eventos
- ✅ Visualizar participantes **apenas dos seus eventos**
- ✅ Marcar presença **apenas nos seus eventos**
- ✅ Emitir certificados **apenas para seus eventos**
- ✅ Acessar relatórios **filtrados aos seus eventos**
- ✅ Participar da comunidade (postar/responder)
- ❌ Não pode acessar Indicadores gerais
- ❌ Não pode gerenciar Instituições
- ❌ Não pode acessar área do estudante
- ❌ Não pode alternar ambientes

#### Menu Sidebar (Professor):
- Painel
- Cronograma
- Cadastrar Evento
- Eventos Anteriores
- Participantes (filtrado)
- Lista Participantes (filtrado)
- Oficinas (filtrado)
- Workshops (filtrado)
- Palestras (filtrado)
- Relatórios (filtrado)
- Avaliações
- Comunidade

---

### 🔷 ESTUDANTE

**Participação em Eventos e Atividades**

#### Rotas Acessíveis:
- `/student` - Ambiente exclusivo do estudante
- ❌ `/` - Bloqueado (redireciona para `/student`)

#### Permissões:
- ✅ Visualizar eventos disponíveis
- ✅ Inscrever-se em eventos
- ✅ Cancelar próprias inscrições
- ✅ Visualizar próprias atividades
- ✅ Visualizar e baixar próprios certificados
- ✅ Compartilhar certificados
- ✅ Participar da comunidade (postar/comentar)
- ✅ Visualizar ranking
- ✅ Dar feedback/avaliações
- ✅ Visualizar histórico de participação
- ❌ Não pode criar/editar eventos
- ❌ Não pode acessar painel administrativo
- ❌ Não pode marcar presenças
- ❌ Não pode emitir certificados
- ❌ Não pode visualizar relatórios gerenciais

#### Menu Sidebar (Estudante):
- Início
- Eventos Disponíveis
- Minhas Atividades
- Certificados
- Ranking
- Avaliações
- Comunidade
- Histórico
- Perfil

---

## 🛡️ Implementação de Segurança

### 1. Row Level Security (RLS) - Supabase

Todas as tabelas possuem políticas RLS que garantem acesso baseado no role:

#### Tabela: `eventos`
```sql
-- Professores veem seus eventos + eventos ativos
-- Admins veem todos
CREATE POLICY "Users can view events by role" ON eventos
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  responsavel_id = auth.uid() OR
  status = 'ativo'
);

-- Professores editam apenas seus eventos
CREATE POLICY "Professors can update own events" ON eventos
FOR UPDATE USING (
  is_admin(auth.uid()) OR 
  responsavel_id = auth.uid()
);
```

#### Tabela: `atividades`
```sql
-- Professores veem atividades dos seus eventos
CREATE POLICY "Users can view activities by role" ON atividades
FOR SELECT USING (
  is_admin(auth.uid()) OR
  get_user_role(auth.uid()) = 'estudante' OR
  evento_id IN (SELECT id FROM eventos WHERE responsavel_id = auth.uid())
);
```

#### Tabela: `certificados`
```sql
-- Estudantes veem próprios, professores veem de seus eventos
CREATE POLICY "Users can view certificates by role" ON certificados
FOR SELECT USING (
  usuario_id = auth.uid() OR
  is_admin(auth.uid()) OR
  evento_id IN (SELECT id FROM eventos WHERE responsavel_id = auth.uid())
);
```

### 2. Guardas de Navegação (Frontend)

#### `ProtectedRoute` Component
- Verifica autenticação
- Redireciona para área apropriada baseado no role
- Estudantes → `/student`
- Professores/Admins → `/`

#### `RoleGuard` Component
- Proteção granular de rotas específicas
- Usado para Indicadores (apenas admin)
- Usado para Instituições (apenas admin)
- Exibe toast de "Acesso Negado" quando apropriado

### 3. Visibilidade de UI

#### Sidebar
```tsx
// Indicadores apenas para admin
{isAdmin && (
  <SidebarItem icon={<ChartBar />} text="Indicadores" />
)}

// Instituições apenas para admin
{isAdmin && (
  <SidebarItem icon={<Building2 />} text="Instituições" />
)}
```

#### Navbar
```tsx
// Environment Switcher apenas para admin
{isAdmin && <EnvironmentSwitcher />}
```

---

## 🧪 Usuários de Teste

### Admin
- **Email:** `juniormelo884@gmail.com`
- **Senha:** *Use sua senha cadastrada*
- **Ambiente:** Painel Administrativo + Pode visualizar área do estudante

### Professor
- **Email:** `professor@teste.com`
- **Senha:** `123456789`
- **Ambiente:** Apenas Painel Administrativo (com dados filtrados)

### Estudante
- **Email:** `joshmelo128@gmail.com`
- **Senha:** *Use sua senha cadastrada*
- **Ambiente:** Apenas área do estudante (`/student`)

---

## 📊 Fluxos de Navegação

### Fluxo Admin:
```
Login → Dashboard Admin → Pode criar eventos → Pode gerenciar tudo
     ↓
     Environment Switcher → Visualizar como Estudante
```

### Fluxo Professor:
```
Login → Dashboard Admin → Pode criar eventos (será responsável)
     → Vê apenas SEUS eventos nos relatórios/participantes
     ❌ Não pode acessar /student
```

### Fluxo Estudante:
```
Login → Dashboard Estudante → Inscreve-se em eventos
     → Participa de atividades → Recebe certificados
     ❌ Redireciona de / para /student automaticamente
```

---

## 🔐 Validações de Segurança

### Backend (Supabase RLS)
✅ **Impede** professor de editar eventos de outros via API  
✅ **Impede** estudante de acessar dados de outros estudantes  
✅ **Impede** acesso direto a tabelas sem autenticação  
✅ **Filtra** automaticamente dados baseado em `auth.uid()`

### Frontend (React Guards)
✅ **Redireciona** estudantes que tentam acessar `/`  
✅ **Redireciona** professores que tentam acessar `/student`  
✅ **Oculta** botões e menus inacessíveis  
✅ **Valida** permissões antes de renderizar componentes

---

## 🔄 Alterações Futuras

Para adicionar novos roles ou permissões:

1. **Adicionar enum no banco:**
```sql
ALTER TYPE app_role ADD VALUE 'novo_role';
```

2. **Criar policies RLS específicas:**
```sql
CREATE POLICY "Novo role policy" ON tabela
FOR SELECT USING (get_user_role(auth.uid()) = 'novo_role');
```

3. **Atualizar `ProtectedRoute` e `RoleGuard`:**
```tsx
<ProtectedRoute allowedRoles={['admin', 'professor', 'novo_role']}>
```

4. **Adicionar verificação no `useUserProfile`:**
```tsx
const isNovoRole = profile?.tipo_perfil === 'novo_role';
```

---

## 📞 Suporte

Em caso de problemas com permissões:
1. Verificar se o usuário possui role correto em `usuarios.tipo_perfil`
2. Verificar se existe entrada em `user_roles`
3. Verificar logs de RLS no Supabase
4. Testar diretamente as queries SQL
5. Verificar console do navegador para erros de redirecionamento

---

**Última Atualização:** 2025-01-12  
**Versão do Sistema:** 1.0.0
