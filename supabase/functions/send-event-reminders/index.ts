import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderConfig {
  daysAhead: number;
  label: string;
  urgency: 'low' | 'medium' | 'high';
  emoji: string;
}

const REMINDER_CONFIGS: ReminderConfig[] = [
  { daysAhead: 15, label: 'faltam 15 dias', urgency: 'low', emoji: '📅' },
  { daysAhead: 10, label: 'faltam 10 dias', urgency: 'low', emoji: '📅' },
  { daysAhead: 1, label: 'é amanhã', urgency: 'medium', emoji: '⏰' },
  { daysAhead: 0, label: 'é hoje', urgency: 'high', emoji: '🎯' },
];

const handler = async (req: Request): Promise<Response> => {
  console.log("send-event-reminders function called at:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let totalNotifications = 0;
    let totalEmails = 0;

    for (const config of REMINDER_CONFIGS) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + config.daysAhead);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`Checking events for ${config.label} (${targetDate.toISOString().split('T')[0]})`);

      // Get events happening on target date
      const { data: events, error: eventsError } = await supabase
        .from('eventos')
        .select('id, titulo, data_inicio, local, tipo')
        .eq('status', 'ativo')
        .gte('data_inicio', startOfDay.toISOString())
        .lte('data_inicio', endOfDay.toISOString());

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        continue;
      }

      console.log(`Found ${events?.length || 0} events for ${config.label}`);

      for (const event of events || []) {
        // Get all registered users for this event
        const { data: registrations, error: regError } = await supabase
          .from('inscricoes_eventos')
          .select(`
            usuario_id,
            usuarios:usuario_id (
              id,
              nome_completo,
              email
            )
          `)
          .eq('evento_id', event.id)
          .eq('status', 'confirmada');

        if (regError) {
          console.error("Error fetching registrations:", regError);
          continue;
        }

        console.log(`Found ${registrations?.length || 0} registrations for event "${event.titulo}"`);

        const eventDate = new Date(event.data_inicio);
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });

        for (const reg of registrations || []) {
          const user = reg.usuarios as any;
          if (!user?.email) continue;

          // Check if notification already sent today for this event/user/reminder type
          const reminderKey = `reminder_${config.daysAhead}_${event.id}`;
          const { data: existingNotif } = await supabase
            .from('notificacoes')
            .select('id')
            .eq('usuario_id', user.id)
            .eq('tipo', reminderKey)
            .gte('created_at', today.toISOString())
            .limit(1);

          if (existingNotif && existingNotif.length > 0) {
            console.log(`Notification already sent to ${user.email} for ${reminderKey}`);
            continue;
          }

          // Create in-app notification
          let notifTitle = '';
          let notifMessage = '';

          if (config.daysAhead === 0) {
            notifTitle = `🎯 O evento é HOJE!`;
            notifMessage = `"${event.titulo}" acontece hoje! ${formattedDate}${event.local ? ` - ${event.local}` : ''}`;
          } else if (config.daysAhead === 1) {
            notifTitle = `⏰ O evento é amanhã!`;
            notifMessage = `"${event.titulo}" acontece amanhã! ${formattedDate}${event.local ? ` - ${event.local}` : ''}`;
          } else {
            notifTitle = `📅 Lembrete: ${config.label} para o evento`;
            notifMessage = `"${event.titulo}" - ${formattedDate}${event.local ? ` - ${event.local}` : ''}`;
          }

          const { error: notifError } = await supabase
            .from('notificacoes')
            .insert({
              usuario_id: user.id,
              titulo: notifTitle,
              mensagem: notifMessage,
              tipo: reminderKey,
              link: '/student/events',
              lida: false
            });

          if (!notifError) {
            totalNotifications++;
            console.log(`In-app notification created for ${user.email}`);
          }

          // Send email
          const urgencyColors = {
            low: '#5D66D1',
            medium: '#F59E0B',
            high: '#EF4444'
          };

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
                    <h1 style="color: ${urgencyColors[config.urgency]}; margin: 0; font-size: 28px;">
                      ${config.emoji} ${config.daysAhead === 0 ? 'O evento é HOJE!' : config.daysAhead === 1 ? 'O evento é AMANHÃ!' : `Lembrete: ${config.label}!`}
                    </h1>
                  </div>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                    Olá, <strong>${user.nome_completo}</strong>!
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                    ${config.daysAhead === 0 
                      ? 'O evento que você está inscrito acontece <strong>hoje</strong>! Não perca!' 
                      : config.daysAhead === 1 
                        ? 'O evento que você está inscrito acontece <strong>amanhã</strong>! Prepare-se!'
                        : `Este é um lembrete de que ${config.label} para o evento que você está inscrito.`
                    }
                  </p>
                  
                  <div style="background: linear-gradient(135deg, ${urgencyColors[config.urgency]} 0%, ${urgencyColors[config.urgency]}CC 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
                    <h2 style="margin: 0 0 16px 0; font-size: 20px;">${event.titulo}</h2>
                    <p style="margin: 8px 0; font-size: 14px; opacity: 0.95;">
                      📅 <strong>Data:</strong> ${formattedDate}
                    </p>
                    ${event.local ? `
                    <p style="margin: 8px 0; font-size: 14px; opacity: 0.95;">
                      📍 <strong>Local:</strong> ${event.local}
                    </p>
                    ` : ''}
                    <p style="margin: 8px 0; font-size: 14px; opacity: 0.95;">
                      🎫 <strong>Tipo:</strong> ${event.tipo}
                    </p>
                  </div>
                  
                  ${config.daysAhead <= 1 ? `
                  <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #92400E; margin: 0; font-size: 14px;">
                      ⚠️ <strong>Importante:</strong> Chegue com antecedência para garantir sua participação!
                    </p>
                  </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-top: 32px;">
                    <a href="https://athunna.com/student/events" style="display: inline-block; background-color: ${urgencyColors[config.urgency]}; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      Ver Detalhes do Evento
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

          try {
            await resend.emails.send({
              from: "Athunna <contato@athunna.com>",
              to: [user.email],
              subject: `${config.emoji} ${config.daysAhead === 0 ? 'HOJE:' : config.daysAhead === 1 ? 'AMANHÃ:' : 'Lembrete:'} ${event.titulo}`,
              html: emailHtml,
            });
            totalEmails++;
            console.log(`Email sent to ${user.email}`);
          } catch (emailError) {
            console.error(`Error sending email to ${user.email}:`, emailError);
          }
        }
      }
    }

    console.log(`Total notifications created: ${totalNotifications}, Total emails sent: ${totalEmails}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Lembretes processados: ${totalNotifications} notificações, ${totalEmails} e-mails` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminders:", error);
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
