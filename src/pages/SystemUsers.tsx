import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserCog, UserPlus, UserMinus, History, Edit, GraduationCap } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface Institution {
  id: string;
  nome: string;
  sigla: string;
}

interface User {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string | null;
  tipo_perfil: string;
  curso: string | null;
  semestre: string | null;
  created_at: string;
}

interface UsersByInstitution {
  [institutionId: string]: {
    institution: Institution;
    users: User[];
  };
}

const SystemUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersByInstitution, setUsersByInstitution] = useState<UsersByInstitution>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [demoteToRole, setDemoteToRole] = useState<'professor' | 'estudante'>('professor');
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false);
  const [editStudentData, setEditStudentData] = useState({ curso: '', semestre: '' });
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    nome_completo: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar instituições
        const { data: institutions, error: instError } = await supabase
          .from('instituicoes')
          .select('*')
          .order('nome');

        if (instError) throw instError;

        // Buscar todos os usuários
        const { data: users, error: usersError } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Organizar usuários por instituição (por enquanto todos na primeira instituição)
        // TODO: Adicionar campo instituicao_id na tabela usuarios
        const organized: UsersByInstitution = {};
        
        if (institutions && institutions.length > 0) {
          institutions.forEach(inst => {
            organized[inst.id] = {
              institution: inst,
              users: users || []
            };
          });
        }

        setUsersByInstitution(organized);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = Object.entries(usersByInstitution).reduce((acc, [instId, data]) => {
    const filteredUsers = data.users.filter(user =>
      user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tipo_perfil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.curso && user.curso.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filteredUsers.length > 0) {
      acc[instId] = {
        ...data,
        users: filteredUsers
      };
    }

    return acc;
  }, {} as UsersByInstitution);

  const getProfileBadgeVariant = (profile: string) => {
    switch (profile) {
      case 'admin':
        return 'destructive';
      case 'professor':
        return 'default';
      case 'estudante':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handlePromoteToAdmin = async () => {
    if (!selectedUser || !user) return;

    try {
      // Verificar se já é admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', selectedUser.id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: "Usuário já é administrador",
          description: "Este usuário já possui perfil de administrador.",
          variant: "destructive"
        });
        setShowPromoteDialog(false);
        return;
      }

      // Adicionar role de admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      // Atualizar tipo_perfil na tabela usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ tipo_perfil: 'admin' })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Registrar auditoria
      const { error: auditError } = await supabase
        .from('profile_audit_log')
        .insert({
          user_id: selectedUser.id,
          changed_by: user.id,
          previous_role: selectedUser.tipo_perfil as 'admin' | 'professor' | 'estudante',
          new_role: 'admin',
          action_type: 'promote',
          notes: `Promovido de ${selectedUser.tipo_perfil} para admin`
        });

      if (auditError) console.error('Audit log error:', auditError);

      // Enviar notificação por email
      const { data: userData } = await supabase
        .from('usuarios')
        .select('nome_completo, email')
        .eq('id', user.id)
        .single();

      try {
        await supabase.functions.invoke('send-profile-notification', {
          body: {
            userEmail: selectedUser.email,
            userName: selectedUser.nome_completo,
            actionType: 'promote',
            previousRole: selectedUser.tipo_perfil,
            newRole: 'admin',
            changedBy: userData?.nome_completo || user.email || 'Administrador'
          }
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Não bloqueia o fluxo se o email falhar
      }

      toast({
        title: "Sucesso!",
        description: `${selectedUser.nome_completo} foi promovido a administrador.`
      });

      setShowPromoteDialog(false);
      setSelectedUser(null);
      
      // Recarregar dados
      window.location.reload();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro ao promover usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDemoteAdmin = async () => {
    if (!selectedUser || !user) return;

    try {
      // Remover role de admin
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('role', 'admin');

      if (deleteError) throw deleteError;

      // Atualizar para novo perfil
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ tipo_perfil: demoteToRole })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Adicionar nova role se for professor
      if (demoteToRole === 'professor') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.id,
            role: 'professor'
          });

        if (roleError) throw roleError;
      }

      // Registrar auditoria
      const { error: auditError } = await supabase
        .from('profile_audit_log')
        .insert({
          user_id: selectedUser.id,
          changed_by: user.id,
          previous_role: 'admin',
          new_role: demoteToRole,
          action_type: 'demote',
          notes: `Rebaixado de admin para ${demoteToRole}`
        });

      if (auditError) console.error('Audit log error:', auditError);

      // Enviar notificação por email
      const { data: userData } = await supabase
        .from('usuarios')
        .select('nome_completo, email')
        .eq('id', user.id)
        .single();

      try {
        await supabase.functions.invoke('send-profile-notification', {
          body: {
            userEmail: selectedUser.email,
            userName: selectedUser.nome_completo,
            actionType: 'demote',
            previousRole: 'admin',
            newRole: demoteToRole,
            changedBy: userData?.nome_completo || user.email || 'Administrador'
          }
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Não bloqueia o fluxo se o email falhar
      }

      toast({
        title: "Sucesso!",
        description: `${selectedUser.nome_completo} foi rebaixado para ${demoteToRole}.`
      });

      setShowDemoteDialog(false);
      setSelectedUser(null);
      
      // Recarregar dados
      window.location.reload();
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast({
        title: "Erro ao rebaixar usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateAdmin = async () => {
    if (!user) return;

    try {
      // Validar dados
      if (!newAdminData.email || !newAdminData.nome_completo) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos para criar um administrador.",
          variant: "destructive"
        });
        return;
      }

      // Definir emails especiais (não precisam trocar senha)
      const specialEmails = [
        'joaotavaresneto1997@gmail.com',
        'djrmarinho@gmail.com'
      ];
      const isSpecialUser = specialEmails.includes(newAdminData.email.toLowerCase());

      // Se for usuário especial, usar a senha fornecida, senão usar senha padrão
      const passwordToUse = isSpecialUser 
        ? newAdminData.password 
        : '12345678';

      // Validar senha
      if (!passwordToUse || passwordToUse.length < 8) {
        toast({
          title: "Senha inválida",
          description: "A senha deve ter no mínimo 8 caracteres.",
          variant: "destructive"
        });
        return;
      }

      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminData.email,
        password: passwordToUse,
        options: {
          data: {
            nome_completo: newAdminData.nome_completo,
            tipo_perfil: 'admin'
          }
        }
      });

      if (authError) throw authError;

      // Registrar auditoria e enviar email (aguardar um pouco para o usuário ser criado)
      setTimeout(async () => {
        if (authData.user) {
          // Registrar auditoria
          await supabase
            .from('profile_audit_log')
            .insert({
              user_id: authData.user.id,
              changed_by: user.id,
              previous_role: 'estudante',
              new_role: 'admin',
              action_type: 'create',
              notes: `Conta de administrador criada por ${user.email}`
            });

          // Enviar email de boas-vindas
          try {
            await supabase.functions.invoke('send-admin-welcome-email', {
              body: {
                email: newAdminData.email,
                admin_name: newAdminData.nome_completo,
                require_password_change: !isSpecialUser,
                temporary_password: !isSpecialUser ? '12345678' : undefined
              }
            });
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }
        }
      }, 2000);

      toast({
        title: "Administrador criado!",
        description: `${newAdminData.nome_completo} foi criado como administrador. ${!isSpecialUser ? 'Email de boas-vindas enviado com senha temporária.' : 'Email de boas-vindas enviado.'}`
      });

      setShowCreateAdminDialog(false);
      setNewAdminData({ email: '', password: '', nome_completo: '' });
      
      // Recarregar dados
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Erro ao criar administrador",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_audit_log')
        .select(`
          *,
          user:user_id(nome_completo, email),
          changed_by_user:changed_by(nome_completo, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setAuditLogs(data || []);
      setShowAuditLog(true);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditStudent = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditStudentData({
      curso: userToEdit.curso || '',
      semestre: userToEdit.semestre || ''
    });
    setShowEditStudentDialog(true);
  };

  const handleSaveStudentData = async () => {
    if (!selectedUser) return;

    setIsSavingStudent(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          curso: editStudentData.curso || null,
          semestre: editStudentData.semestre || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Dados atualizados",
        description: `Curso e semestre de ${selectedUser.nome_completo} foram atualizados.`
      });

      setShowEditStudentDialog(false);
      setSelectedUser(null);
      
      // Atualizar lista local
      setUsersByInstitution(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(instId => {
          updated[instId].users = updated[instId].users.map(u => 
            u.id === selectedUser.id 
              ? { ...u, curso: editStudentData.curso || null, semestre: editStudentData.semestre || null }
              : u
          );
        });
        return updated;
      });
    } catch (error: any) {
      console.error('Error updating student data:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingStudent(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Usuários do Sistema</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários cadastrados por instituição</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={loadAuditLogs}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Ver Logs
          </Button>
          <Button
            onClick={() => setShowCreateAdminDialog(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Criar Admin
          </Button>
        </div>
      </div>

      <div className="relative w-full md:w-80 mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
            placeholder="Buscar por nome, email, curso..." 
            className="pl-10 pr-4 w-full" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Carregando usuários...</p>
          </CardContent>
        </Card>
      ) : Object.keys(filteredData).length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              {searchTerm ? 'Nenhum usuário encontrado com os filtros aplicados.' : 'Nenhuma instituição cadastrada.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredData).map(([instId, data]) => (
            <Card key={instId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{data.institution.nome} {data.institution.sigla && `(${data.institution.sigla})`}</span>
                  <Badge variant="outline">{data.users.length} usuários</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Semestre</TableHead>
                        <TableHead>Tipo de Perfil</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.users.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">{userItem.nome_completo}</TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>{userItem.telefone || '-'}</TableCell>
                          <TableCell>{userItem.curso || '-'}</TableCell>
                          <TableCell>{userItem.semestre || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={getProfileBadgeVariant(userItem.tipo_perfil)}>
                              {userItem.tipo_perfil}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(userItem.created_at), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              {userItem.tipo_perfil === 'estudante' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditStudent(userItem)}
                                  className="gap-1"
                                >
                                  <GraduationCap className="h-4 w-4" />
                                  Curso
                                </Button>
                              )}
                              {userItem.tipo_perfil === 'admin' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(userItem);
                                    setShowDemoteDialog(true);
                                  }}
                                  className="gap-1"
                                >
                                  <UserMinus className="h-4 w-4" />
                                  Rebaixar
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(userItem);
                                    setShowPromoteDialog(true);
                                  }}
                                  className="gap-1"
                                >
                                  <UserCog className="h-4 w-4" />
                                  Promover
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para promover usuário a admin */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promover usuário a Administrador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja promover <strong>{selectedUser?.nome_completo}</strong> a Administrador?
              Esta ação dará acesso total ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromoteToAdmin}>Promover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para rebaixar admin */}
      <Dialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rebaixar Administrador</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover as permissões de administrador de <strong>{selectedUser?.nome_completo}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo perfil</Label>
              <select
                value={demoteToRole}
                onChange={(e) => setDemoteToRole(e.target.value as 'professor' | 'estudante')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="professor">Professor</option>
                <option value="estudante">Estudante</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDemoteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDemoteAdmin}>
              Rebaixar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar novo admin */}
      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo Administrador</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma conta de administrador. 
              Para novos admins, a senha padrão será <strong>12345678</strong> e um email será enviado solicitando a troca.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nome completo</Label>
              <Input
                id="admin-name"
                placeholder="Digite o nome completo"
                value={newAdminData.nome_completo}
                onChange={(e) => setNewAdminData({ ...newAdminData, nome_completo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Digite o email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">
                Senha personalizada (opcional)
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Deixe em branco para usar senha padrão (12345678)"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Se deixar em branco, será usada a senha padrão e o usuário receberá email para trocá-la.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin}>
              Criar Administrador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar logs de auditoria */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log de Auditoria de Perfis</DialogTitle>
            <DialogDescription>
              Histórico de mudanças de perfil dos últimos 50 registros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum registro de auditoria encontrado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário Alterado</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Para</TableHead>
                      <TableHead>Alterado Por</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.user?.nome_completo || 'N/A'}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {log.user?.email || ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            log.action_type === 'promote' ? 'default' : 
                            log.action_type === 'demote' ? 'destructive' : 
                            'secondary'
                          }>
                            {log.action_type === 'promote' ? 'Promoção' :
                             log.action_type === 'demote' ? 'Rebaixamento' :
                             'Criação'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.previous_role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.new_role}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.changed_by_user?.nome_completo || 'Sistema'}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {log.changed_by_user?.email || ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs">
                          {log.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditLog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar curso e semestre do estudante */}
      <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Editar Curso e Semestre
            </DialogTitle>
            <DialogDescription>
              Atualize as informações acadêmicas de <strong>{selectedUser?.nome_completo}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-curso">Curso</Label>
              <Input
                id="edit-curso"
                placeholder="Ex: Ciência da Computação"
                value={editStudentData.curso}
                onChange={(e) => setEditStudentData({ ...editStudentData, curso: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-semestre">Semestre</Label>
              <Input
                id="edit-semestre"
                placeholder="Ex: 6º Semestre"
                value={editStudentData.semestre}
                onChange={(e) => setEditStudentData({ ...editStudentData, semestre: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStudentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStudentData} disabled={isSavingStudent}>
              {isSavingStudent ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemUsers;
