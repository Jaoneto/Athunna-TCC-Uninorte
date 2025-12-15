import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const testEmail = 'estudante@teste.com'
    const testPassword = '123456789'
    const testName = 'Estudante Teste'

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        nome_completo: testName,
        tipo_perfil: 'estudante'
      }
    })

    if (authError) {
      throw authError
    }

    // Create profile in usuarios table
    const { error: profileError } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: authData.user.id,
        email: testEmail,
        nome_completo: testName,
        tipo_perfil: 'estudante',
        curso: 'Curso de Teste',
        semestre: '1º Semestre'
      })

    if (profileError) {
      throw profileError
    }

    // Create role in user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: authData.user.id,
        role: 'estudante'
      })

    if (roleError) {
      throw roleError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estudante de teste criado com sucesso',
        credentials: {
          email: testEmail,
          password: testPassword
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
