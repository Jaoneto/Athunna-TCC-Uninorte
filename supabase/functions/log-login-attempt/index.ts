import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginAttemptRequest {
  email: string;
  success: boolean;
  attemptCount?: number;
  failureReason?: string;
  lockedUntil?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📝 Login attempt logging triggered");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      success, 
      attemptCount, 
      failureReason, 
      lockedUntil,
      userAgent 
    }: LoginAttemptRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`📝 Logging ${success ? 'successful' : 'failed'} login for: ${email}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP from request headers (if available)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Insert log entry
    const { error: insertError } = await supabase
      .from("login_audit_log")
      .insert({
        email,
        success,
        attempt_count: attemptCount || 1,
        ip_address: ipAddress,
        user_agent: userAgent,
        failure_reason: failureReason,
        locked_until: lockedUntil,
      });

    if (insertError) {
      console.error("❌ Error inserting login log:", insertError);
      throw insertError;
    }

    console.log("✅ Login attempt logged successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in log-login-attempt function:", error);
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
