import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmailPreview = () => {
  const logoBase64 = "data:image/png;base64,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";

  const [selectedTemplate, setSelectedTemplate] = useState<"confirm" | "magic" | "reset">("confirm");

  const templates = {
    confirm: {
      title: "Email de Confirmação de Cadastro",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: #f6f7fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
            <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 20px; border-radius: 12px; max-width: 600px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoBase64}" width="160" height="40" alt="Athunna" style="margin: 0 auto;" />
              </div>
              
              <h1 style="color: #1e293b; font-size: 28px; font-weight: 600; line-height: 1.3; margin: 0 0 24px; text-align: center;">
                Bem-vindo ao Athunna!
              </h1>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Olá! Você está a um passo de acessar a plataforma Athunna.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Para confirmar seu cadastro e ativar sua conta, clique no botão abaixo:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="background-color: #5d66d1; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; line-height: 1; padding: 16px 32px; text-decoration: none; text-align: center;">
                  Confirmar Email
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 12px;">
                Este link é válido por 24 horas e pode ser usado apenas uma vez.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 12px;">
                Se você não se cadastrou na plataforma Athunna, pode ignorar este email com segurança.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>
              
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin: 24px 0 0;">
                Athunna - Plataforma de Gestão de Eventos Acadêmicos<br />
                Este é um email automático, por favor não responda.
              </p>
            </div>
          </body>
        </html>
      `
    },
    magic: {
      title: "Magic Link de Acesso",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: #f6f7fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
            <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 20px; border-radius: 12px; max-width: 600px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoBase64}" width="160" height="40" alt="Athunna" style="margin: 0 auto;" />
              </div>
              
              <h1 style="color: #1e293b; font-size: 28px; font-weight: 600; line-height: 1.3; margin: 0 0 24px; text-align: center;">
                Acesso à Plataforma
              </h1>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Você solicitou acesso à plataforma Athunna. Clique no botão abaixo para fazer login:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="background-color: #5d66d1; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; line-height: 1; padding: 16px 32px; text-decoration: none; text-align: center;">
                  Acessar Plataforma
                </a>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Ou copie e cole este código temporário de login:
              </p>
              
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
                <p style="color: #1e293b; font-size: 24px; font-weight: 600; letter-spacing: 2px; margin: 0; font-family: monospace;">
                  ABC123XYZ
                </p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 12px;">
                Este link é válido por 1 hora e pode ser usado apenas uma vez.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>
              
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin: 24px 0 0;">
                Athunna - Plataforma de Gestão de Eventos Acadêmicos<br />
                Este é um email automático, por favor não responda.
              </p>
            </div>
          </body>
        </html>
      `
    },
    reset: {
      title: "Redefinição de Senha",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="background-color: #f6f7fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
            <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 20px; border-radius: 12px; max-width: 600px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${logoBase64}" width="160" height="40" alt="Athunna" style="margin: 0 auto;" />
              </div>
              
              <h1 style="color: #1e293b; font-size: 28px; font-weight: 600; line-height: 1.3; margin: 0 0 24px; text-align: center;">
                Redefinir Senha
              </h1>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Você solicitou a redefinição de senha da sua conta na plataforma Athunna.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Para criar uma nova senha, clique no botão abaixo:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="background-color: #5d66d1; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; line-height: 1; padding: 16px 32px; text-decoration: none; text-align: center;">
                  Redefinir Senha
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 12px;">
                Este link é válido por 1 hora e pode ser usado apenas uma vez.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                  ⚠️ <strong>Importante:</strong> Se você não solicitou a redefinição de senha, 
                  ignore este email e sua senha permanecerá inalterada.
                </p>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; margin: 32px 0;"></div>
              
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin: 24px 0 0;">
                Athunna - Plataforma de Gestão de Eventos Acadêmicos<br />
                Este é um email automático, por favor não responda.
              </p>
            </div>
          </body>
        </html>
      `
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Templates de Email</CardTitle>
            <CardDescription>
              Visualize como os emails personalizados do Athunna serão exibidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="confirm">Confirmação</TabsTrigger>
                <TabsTrigger value="magic">Magic Link</TabsTrigger>
                <TabsTrigger value="reset">Redefinir Senha</TabsTrigger>
              </TabsList>
              
              {Object.entries(templates).map(([key, template]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{template.title}</h3>
                    </div>
                    <div 
                      className="border rounded-lg p-4 bg-white overflow-auto max-h-[600px]"
                      dangerouslySetInnerHTML={{ __html: template.html }}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailPreview;
