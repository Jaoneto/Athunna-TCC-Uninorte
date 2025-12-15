import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, User, GraduationCap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TestUsersInfo = () => {
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const testUsers = [
    {
      role: 'Admin',
      icon: <Settings className="h-4 w-4" />,
      name: 'Administrador',
      email: 'juniormelo884@gmail.com',
      password: 'Use sua senha',
      color: 'bg-purple-500',
      status: '✅ Ativo',
      features: [
        'Acesso total ao sistema',
        'Gerencia instituições',
        'Visualiza indicadores gerais',
        'Pode alternar entre ambientes (Admin/Estudante)',
        'Gerencia todos os eventos e usuários'
      ]
    },
    {
      role: 'Professor',
      icon: <User className="h-4 w-4" />,
      name: 'Maria Professora',
      email: 'professor@teste.com',
      password: '123456789',
      color: 'bg-blue-500',
      status: '✅ Pronto',
      features: [
        'Cria e gerencia próprios eventos',
        'Marca presença em seus eventos',
        'Emite certificados para seus eventos',
        'Visualiza participantes dos seus eventos',
        'Acessa relatórios dos seus eventos'
      ]
    },
    {
      role: 'Estudante',
      icon: <GraduationCap className="h-4 w-4" />,
      name: 'José Estudante',
      email: 'joshmelo128@gmail.com',
      password: 'Use sua senha',
      color: 'bg-green-500',
      status: '✅ Ativo',
      features: [
        'Inscreve-se em eventos',
        'Visualiza próprios certificados',
        'Participa da comunidade',
        'Visualiza ranking',
        'Acessa apenas área de estudante'
      ]
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência.`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>👥 Sistema de Usuários e Permissões</span>
          <Badge variant="secondary">Ambiente de Desenvolvimento</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Credenciais de teste para os 3 perfis do sistema:
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs"
          >
            {showPasswords ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showPasswords ? 'Ocultar' : 'Mostrar'} senhas
          </Button>
        </div>

        <div className="grid gap-4">
          {testUsers.map((user, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${user.color} text-white`}>
                  {user.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{user.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-muted/30 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-xs">
                      {user.email}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.email, 'Email')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Senha:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-xs">
                      {showPasswords ? user.password : '•'.repeat(9)}
                    </code>
                    {user.password !== 'Use sua senha' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.password, 'Senha')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">PERMISSÕES E ACESSOS:</h4>
                <ul className="text-xs space-y-1">
                  {user.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-200 flex items-center gap-2">
              🛡️ Segurança (RLS)
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Row Level Security em todas as tabelas</li>
              <li>• Professores veem apenas seus eventos</li>
              <li>• Estudantes acessam só área própria</li>
              <li>• Validação server-side com Supabase</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-purple-800 dark:text-purple-200 flex items-center gap-2">
              🔐 Navegação Protegida
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Redirecionamento automático por role</li>
              <li>• Guards em todas as rotas sensíveis</li>
              <li>• Mensagens de acesso negado</li>
              <li>• Filtros aplicados nas queries</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border rounded-lg p-4 mt-4">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            📊 Separação de Ambientes
          </h4>
          <div className="grid gap-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900">Admin</Badge>
              <span>→ Acessa painel administrativo + pode visualizar área do estudante</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">Professor</Badge>
              <span>→ Acessa apenas painel administrativo com dados filtrados</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Estudante</Badge>
              <span>→ Acessa apenas ambiente do estudante (/student)</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-center pt-4 border-t text-muted-foreground">
          💡 Sistema de permissões completo implementado com validações em backend e frontend
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUsersInfo;
