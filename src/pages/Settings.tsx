
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Moon, EyeOff, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  privacy: boolean;
  language: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    darkMode: false,
    privacy: false,
    language: 'pt-BR'
  });

  useEffect(() => {
    // Load settings from localStorage if they exist
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings);
      
      // Apply dark mode class to html element
      if (parsedSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const updateSetting = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    // Apply dark mode immediately when toggled
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSetting('language', e.target.value);
  };

  return (
    <div className={`container max-w-4xl mx-auto p-4 md:p-8 min-h-screen transition-colors ${settings.darkMode ? 'dark' : ''}`}>
      <div className="flex items-center mb-8">
        <Link to="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-lg shadow space-y-8 border">
        <section>
          <h2 className="text-lg font-medium mb-4 text-foreground">Preferências gerais</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Notificações</p>
                  <p className="text-sm text-muted-foreground">Receba alertas sobre atualizações e eventos</p>
                </div>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={(checked) => updateSetting('notifications', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Modo escuro</p>
                  <p className="text-sm text-muted-foreground">Mudar para tema escuro</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={(checked) => updateSetting('darkMode', checked)} 
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4 text-foreground">Privacidade e segurança</h2>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Modo privado</p>
                <p className="text-sm text-muted-foreground">Limita o compartilhamento de dados</p>
              </div>
            </div>
            <Switch 
              checked={settings.privacy} 
              onCheckedChange={(checked) => updateSetting('privacy', checked)} 
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4 text-foreground">Preferências regionais</h2>
          
          <div className="flex items-center gap-3 py-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium mb-2 text-foreground">Idioma</p>
              <select 
                className="w-full md:w-64 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </section>

        <div className="border-t border-border pt-4 flex justify-end">
          <Button>Salvar todas as configurações</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
