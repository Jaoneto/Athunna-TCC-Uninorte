import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  type: 'event' | 'activity';
  itemId: string;
  itemTitle: string;
  itemDate: string;
  itemLocal?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-registration-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, type, itemId, itemTitle, itemDate, itemLocal }: NotificationRequest = await req.json();

    console.log("Processing registration notification:", { userId, type, itemId, itemTitle });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('nome_completo, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      throw new Error("Usuário não encontrado");
    }

    console.log("User found:", userData.nome_completo, userData.email);

    // Format date for display
    const eventDate = new Date(itemDate);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const typeLabel = type === 'event' ? 'evento' : 'atividade';
    const typeTitle = type === 'event' ? 'Evento' : 'Atividade';

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notificacoes')
      .insert({
        usuario_id: userId,
        titulo: `Inscrição confirmada!`,
        mensagem: `Sua inscrição em "${itemTitle}" foi confirmada. ${formattedDate}${itemLocal ? ` - ${itemLocal}` : ''}`,
        tipo: 'inscricao',
        link: type === 'event' ? '/student/events' : '/student/activities',
        lida: false
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    } else {
      console.log("In-app notification created successfully");
    }

    // Send email notification
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f7fc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #5D66D1; margin: 0; font-size: 28px;">✅ Inscrição Confirmada!</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Olá, <strong>${userData.nome_completo}</strong>!
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Sua inscrição no ${typeLabel} foi confirmada com sucesso.
            </p>
            
            <div style="background: linear-gradient(135deg, #5D66D1 0%, #7C83E8 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px;">${itemTitle}</h2>
              <p style="margin: 8px 0; font-size: 14px; opacity: 0.9;">
                📅 <strong>Data:</strong> ${formattedDate}
              </p>
              ${itemLocal ? `
              <p style="margin: 8px 0; font-size: 14px; opacity: 0.9;">
                📍 <strong>Local:</strong> ${itemLocal}
              </p>
              ` : ''}
            </div>
            
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
              Você receberá lembretes antes do ${typeLabel}. Fique atento ao seu e-mail e às notificações do sistema.
            </p>
            
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://athunna.com" style="display: inline-block; background-color: #5D66D1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Acessar Athunna
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
            
            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
              Este e-mail foi enviado automaticamente pelo sistema Athunna.<br>
              Por favor, não responda a este e-mail.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Athunna <contato@athunna.com>",
      to: [userData.email],
      subject: `✅ Inscrição Confirmada - ${itemTitle}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notificações enviadas com sucesso" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-registration-notification:", error);
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
