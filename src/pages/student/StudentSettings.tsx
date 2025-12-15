import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newEvents: boolean;
  reminders: boolean;
  certificates: boolean;
  community: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'students' | 'private';
  showAchievements: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

const StudentSettings: React.FC = () => {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    newEvents: true,
    reminders: true,
    certificates: true,
    community: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'students',
    showAchievements: true,
    showProgress: true,
    allowMessages: true
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'system',
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAppSettingChange = (key: keyof AppSettings, value: any) => {
    setAppSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
    
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Solicitação registrada",
      description: "Sua solicitação de exclusão será processada em até 48 horas.",
      variant: "destructive"
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Notificações Push</Label>
                    <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={() => handleNotificationChange('pushNotifications')}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Tipos de Notificação</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-events">Novos Eventos</Label>
                      <p className="text-sm text-gray-600">Seja notificado sobre novos eventos disponíveis</p>
                    </div>
                    <Switch
                      id="new-events"
                      checked={notifications.newEvents}
                      onCheckedChange={() => handleNotificationChange('newEvents')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reminders">Lembretes</Label>
                      <p className="text-sm text-gray-600">Receba lembretes de eventos próximos</p>
                    </div>
                    <Switch
                      id="reminders"
                      checked={notifications.reminders}
                      onCheckedChange={() => handleNotificationChange('reminders')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="certificates">Certificados</Label>
                      <p className="text-sm text-gray-600">Seja notificado quando certificados estiverem disponíveis</p>
                    </div>
                    <Switch
                      id="certificates"
                      checked={notifications.certificates}
                      onCheckedChange={() => handleNotificationChange('certificates')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="community">Atividade da Comunidade</Label>
                      <p className="text-sm text-gray-600">Receba notificações sobre discussões e respostas</p>
                    </div>
                    <Switch
                      id="community"
                      checked={notifications.community}
                      onCheckedChange={() => handleNotificationChange('community')}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                  <p className="text-sm text-gray-600 mb-2">Quem pode ver seu perfil</p>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="students">Apenas Estudantes</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-achievements">Mostrar Conquistas</Label>
                    <p className="text-sm text-gray-600">Permita que outros vejam suas conquistas</p>
                  </div>
                  <Switch
                    id="show-achievements"
                    checked={privacy.showAchievements}
                    onCheckedChange={(checked) => handlePrivacyChange('showAchievements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-progress">Mostrar Progresso</Label>
                    <p className="text-sm text-gray-600">Permita que outros vejam seu progresso</p>
                  </div>
                  <Switch
                    id="show-progress"
                    checked={privacy.showProgress}
                    onCheckedChange={(checked) => handlePrivacyChange('showProgress', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-messages">Permitir Mensagens</Label>
                    <p className="text-sm text-gray-600">Permita que outros estudantes enviem mensagens</p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <p className="text-sm text-gray-600 mb-2">Escolha o tema da interface</p>
                  <Select
                    value={appSettings.theme}
                    onValueChange={(value) => handleAppSettingChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <p className="text-sm text-gray-600 mb-2">Idioma da interface</p>
                  <Select
                    value={appSettings.language}
                    onValueChange={(value) => handleAppSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-format">Formato de Data</Label>
                  <p className="text-sm text-gray-600 mb-2">Como as datas são exibidas</p>
                  <Select
                    value={appSettings.dateFormat}
                    onValueChange={(value) => handleAppSettingChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                      <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Alterar Senha</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({...prev, current: e.target.value}))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({...prev, new: e.target.value}))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({...prev, confirm: e.target.value}))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleChangePassword}>
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Exportar Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Baixe uma cópia de todos os seus dados da plataforma
                </p>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Meus Dados
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Excluir Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                </p>
                <Button onClick={handleDeleteAccount} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Minha Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentSettings;