import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TwoFactorRequest {
  email: string;
  userName?: string;
}

// Generate a 6-digit code
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 2FA code generation triggered");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName }: TwoFactorRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`📧 Generating 2FA code for: ${email}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate any existing codes for this email
    await supabase
      .from("two_factor_codes")
      .delete()
      .eq("email", email);

    // Store new code
    const { error: insertError } = await supabase
      .from("two_factor_codes")
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("❌ Error storing 2FA code:", insertError);
      throw insertError;
    }

    // Send email with code
    const emailResponse = await resend.emails.send({
      from: "Athunna <contato@athunna.com>",
      to: [email],
      subject: "🔐 Seu código de verificação - Athunna",
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
                <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(93, 102, 209, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #5D66D1 0%, #7B83EB 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">🔐</span>
                      </div>
                      <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">Código de Verificação</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px 40px;">
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                        ${userName ? `Olá, <strong>${userName}</strong>!` : 'Olá!'} Use o código abaixo para completar seu login:
                      </p>
                      
                      <div style="background: linear-gradient(135deg, #5D66D1 0%, #7B83EB 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: monospace;">${code}</span>
                      </div>
                      
                      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #F59E0B;">
                        <p style="margin: 0; color: #92400E; font-size: 14px;">
                          ⏱️ Este código expira em <strong>5 minutos</strong>.
                        </p>
                      </div>
                      
                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                        Se você não solicitou este código, ignore este email. Sua conta permanece segura.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Este é um email automático de segurança do Athunna.
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

    console.log("✅ 2FA code sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Code sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-2fa-code function:", error);
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
