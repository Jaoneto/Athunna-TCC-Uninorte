import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userEmail: string;
  userName: string;
  actionType: 'promote' | 'demote' | 'create';
  previousRole: string;
  newRole: string;
  changedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userEmail, 
      userName, 
      actionType, 
      previousRole, 
      newRole,
      changedBy 
    }: NotificationRequest = await req.json();

    console.log('Sending profile notification:', { userEmail, userName, actionType, previousRole, newRole });

    // Definir assunto e conteúdo do email baseado no tipo de ação
    let subject = '';
    let htmlContent = '';

    if (actionType === 'promote') {
      subject = '🎉 Você foi promovido na Plataforma Athunna';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Parabéns, ${userName}! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Você foi promovido!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Temos o prazer de informar que seu perfil na Plataforma Athunna foi promovido por <strong>${changedBy}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Perfil anterior:</strong> ${previousRole}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Novo perfil:</strong> <span style="color: #667eea; font-weight: bold;">${newRole}</span>
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Com seu novo perfil, você terá acesso a funcionalidades adicionais da plataforma. 
              Faça login para explorar suas novas permissões.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('VITE_SUPABASE_URL') || 'https://athunna.lovable.app'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar Plataforma
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Athunna - Plataforma de Gestão de Eventos Acadêmicos<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>
        </div>
      `;
    } else if (actionType === 'demote') {
      subject = '📋 Alteração no seu perfil na Plataforma Athunna';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Alteração de Perfil</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Olá, ${userName}</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Informamos que seu perfil na Plataforma Athunna foi alterado por <strong>${changedBy}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Perfil anterior:</strong> ${previousRole}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Novo perfil:</strong> <span style="color: #f59e0b; font-weight: bold;">${newRole}</span>
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Suas permissões na plataforma foram ajustadas de acordo com o novo perfil. 
              Se você tiver dúvidas sobre esta alteração, entre em contato com um administrador.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('VITE_SUPABASE_URL') || 'https://athunna.lovable.app'}" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar Plataforma
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Athunna - Plataforma de Gestão de Eventos Acadêmicos<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>
        </div>
      `;
    } else { // create
      subject = '🎊 Bem-vindo como Administrador na Plataforma Athunna';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Bem-vindo, ${userName}! 🎊</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Sua conta foi criada!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Uma conta de <strong>administrador</strong> foi criada para você na Plataforma Athunna por <strong>${changedBy}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Email:</strong> ${userEmail}
              </p>
              <p style="margin: 5px 0; color: #6b7280;">
                <strong>Perfil:</strong> <span style="color: #10b981; font-weight: bold;">Administrador</span>
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Como administrador, você terá acesso completo à plataforma, incluindo:
            </p>
            
            <ul style="color: #6b7280; font-size: 16px; line-height: 1.8;">
              <li>Gestão de eventos e atividades</li>
              <li>Gerenciamento de usuários</li>
              <li>Emissão de certificados</li>
              <li>Acesso a relatórios e estatísticas</li>
              <li>Configurações do sistema</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('VITE_SUPABASE_URL') || 'https://athunna.lovable.app'}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Fazer Login
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
              Athunna - Plataforma de Gestão de Eventos Acadêmicos<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>
        </div>
      `;
    }

    const { error } = await resend.emails.send({
      from: 'Athunna <onboarding@resend.dev>',
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Profile notification sent successfully to:', userEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-profile-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
