import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  email: string;
  attemptCount: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔒 Security alert function triggered");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, attemptCount, ipAddress, userAgent, timestamp }: SecurityAlertRequest = await req.json();

    console.log(`📧 Sending security alert to: ${email}`);
    console.log(`⚠️ Failed attempts: ${attemptCount}`);

    const emailResponse = await resend.emails.send({
      from: "Athunna <contato@athunna.com>",
      to: [email],
      subject: "⚠️ Alerta de Segurança - Tentativas de Login Suspeitas",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f7fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(93, 102, 209, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #5D66D1 0%, #7B83EB 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">🔒</span>
                      </div>
                      <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">Alerta de Segurança</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #F59E0B;">
                        <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
                          ⚠️ Detectamos atividade suspeita em sua conta
                        </p>
                      </div>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Identificamos <strong style="color: #DC2626;">${attemptCount} tentativas de login falhas</strong> em sua conta Athunna.
                      </p>
                      
                      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Detalhes do Evento</h3>
                        <table style="width: 100%; font-size: 14px;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Data/Hora:</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right; border-bottom: 1px solid #e5e7eb;">${timestamp}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Tentativas:</td>
                            <td style="padding: 8px 0; color: #DC2626; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${attemptCount} falhas</td>
                          </tr>
                          ${ipAddress ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280;">IP:</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right; font-family: monospace;">${ipAddress}</td>
                          </tr>
                          ` : ''}
                        </table>
                      </div>
                      
                      <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px;">O que fazer?</h3>
                      <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
                        <li>Se foi você, não se preocupe. Tente redefinir sua senha.</li>
                        <li>Se não foi você, recomendamos alterar sua senha imediatamente.</li>
                        <li>Nunca compartilhe suas credenciais com terceiros.</li>
                      </ul>
                      
                      <div style="text-align: center;">
                        <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/login" 
                           style="display: inline-block; background: linear-gradient(135deg, #5D66D1 0%, #7B83EB 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          Acessar Minha Conta
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                        Este é um email automático de segurança do Athunna.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Se você não reconhece esta atividade, entre em contato conosco.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("❌ Resend error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("✅ Security alert sent successfully:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-security-alert function:", error);
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
