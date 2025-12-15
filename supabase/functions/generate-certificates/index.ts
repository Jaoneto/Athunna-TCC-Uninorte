import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateCertificatesRequest {
  atividade_id?: string;
  evento_id?: string;
  usuario_id?: string; // Para geração individual
}

function generateVerificationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Verify user is admin or professor
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || (userRole.role !== "admin" && userRole.role !== "professor")) {
      throw new Error("Only admins and professors can generate certificates");
    }

    const { atividade_id, evento_id, usuario_id }: GenerateCertificatesRequest = await req.json();

    if (!atividade_id && !evento_id) {
      throw new Error("atividade_id or evento_id is required");
    }

    // Fetch activity data
    let activityData: any = null;
    if (atividade_id) {
      const { data: activity } = await supabase
        .from("atividades")
        .select("id, titulo, carga_horaria, tipo, evento_id")
        .eq("id", atividade_id)
        .single();
      activityData = activity;
    }

    const targetEventoId = activityData?.evento_id || evento_id;

    // Fetch system participants with confirmed attendance
    let participantsQuery = supabase
      .from("participacoes_atividades")
      .select(`
        id,
        usuario_id,
        atividade_id,
        presenca,
        atividades!inner (
          id,
          titulo,
          carga_horaria,
          tipo,
          evento_id
        )
      `)
      .eq("presenca", true);

    if (atividade_id) {
      participantsQuery = participantsQuery.eq("atividade_id", atividade_id);
    } else if (evento_id) {
      participantsQuery = participantsQuery.eq("atividades.evento_id", evento_id);
    }

    // Se usuario_id foi fornecido, filtra apenas para esse usuário (geração individual)
    if (usuario_id) {
      participantsQuery = participantsQuery.eq("usuario_id", usuario_id);
    }

    const { data: participants, error: participantsError } = await participantsQuery;

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw new Error("Failed to fetch participants");
    }

    // Fetch public registrations with presence confirmed
    let publicParticipants: any[] = [];
    if (targetEventoId) {
      const { data: publicData, error: publicError } = await supabase
        .from("inscricoes_publicas")
        .select("*")
        .eq("evento_id", targetEventoId)
        .eq("status", "presente");

      if (publicError) {
        console.error("Error fetching public registrations:", publicError);
      } else {
        publicParticipants = publicData || [];
      }
    }

    const totalParticipants = (participants?.length || 0) + publicParticipants.length;

    if (totalParticipants === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No participants with confirmed attendance found",
          generated: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${participants?.length || 0} system participants and ${publicParticipants.length} public registrations with confirmed attendance`);

    // Check for existing certificates to avoid duplicates
    const existingCertificatesQuery = supabase
      .from("certificados")
      .select("usuario_id, atividade_id, codigo_verificacao");

    if (atividade_id) {
      existingCertificatesQuery.eq("atividade_id", atividade_id);
    }

    const { data: existingCerts } = await existingCertificatesQuery;
    const existingSet = new Set(
      (existingCerts || []).map(c => `${c.usuario_id}-${c.atividade_id}`)
    );
    
    // Also check for public certificates by verification code pattern
    const existingPublicCodes = new Set(
      (existingCerts || []).filter(c => c.codigo_verificacao.startsWith("PUB-")).map(c => c.codigo_verificacao)
    );

    const certificatesToCreate = [];

    // Process system participants
    for (const participant of (participants || [])) {
      const atividade = participant.atividades as any;
      const key = `${participant.usuario_id}-${participant.atividade_id}`;
      
      if (existingSet.has(key)) {
        console.log(`Certificate already exists for user ${participant.usuario_id} and activity ${participant.atividade_id}`);
        continue;
      }

      certificatesToCreate.push({
        usuario_id: participant.usuario_id,
        atividade_id: participant.atividade_id,
        evento_id: atividade?.evento_id || evento_id,
        codigo_verificacao: generateVerificationCode(),
        tipo: atividade?.tipo || "Participação",
        carga_horaria: atividade?.carga_horaria || 1,
        data_emissao: new Date().toISOString(),
      });
    }

    // Note: Public participants need a user account to receive certificates
    // For now, we'll log them but won't create certificates without user_id
    if (publicParticipants.length > 0) {
      console.log(`${publicParticipants.length} public participants marked as present. They need to create an account to receive certificates.`);
    }

    if (certificatesToCreate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All certificates already exist or participants need accounts",
          generated: 0,
          publicPending: publicParticipants.length
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: createdCerts, error: insertError } = await supabase
      .from("certificados")
      .insert(certificatesToCreate)
      .select();

    if (insertError) {
      console.error("Error inserting certificates:", insertError);
      throw new Error("Failed to create certificates");
    }

    console.log(`Successfully created ${createdCerts?.length || 0} certificates`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${createdCerts?.length || 0} certificates generated successfully`,
        generated: createdCerts?.length || 0,
        certificates: createdCerts
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-certificates function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
