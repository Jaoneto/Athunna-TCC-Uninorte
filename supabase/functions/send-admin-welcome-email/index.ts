import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { WelcomeAdminEmail } from './_templates/welcome-admin.tsx';
import { WelcomeAdminChangePasswordEmail } from './_templates/welcome-admin-change-password.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  admin_name: string;
  require_password_change: boolean;
  temporary_password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Send admin welcome email function called');
    
    const { email, admin_name, require_password_change, temporary_password }: WelcomeEmailRequest = await req.json();

    console.log('📨 Sending welcome email to:', email);
    console.log('🔐 Require password change:', require_password_change);

    let html: string;
    let subject: string;

    if (require_password_change && temporary_password) {
      console.log('🔑 Rendering welcome with password change email...');
      subject = 'Bem-vindo ao Athunna - Troque sua senha';
      html = await renderAsync(
        React.createElement(WelcomeAdminChangePasswordEmail, {
          admin_name,
          email,
          temporary_password,
        })
      );
    } else {
      console.log('👋 Rendering welcome email...');
      subject = 'Bem-vindo ao Athunna';
      html = await renderAsync(
        React.createElement(WelcomeAdminEmail, {
          admin_name,
        })
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Athunna <contato@athunna.com>",
      to: [email],
      subject,
      html,
    });

    if (emailResponse.error) {
      console.error("❌ Resend error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("✅ Email sent successfully:", emailResponse.data?.id);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-admin-welcome-email function:", error);
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
