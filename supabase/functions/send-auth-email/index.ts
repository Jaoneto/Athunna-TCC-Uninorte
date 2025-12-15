import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmSignupEmail } from './_templates/confirm-signup.tsx'
import { MagicLinkEmail } from './_templates/magic-link.tsx'
import { ResetPasswordEmail } from './_templates/reset-password.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  console.log('📧 Email webhook triggered')

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method)
    return new Response('Method not allowed', { status: 400 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('🔐 Verifying webhook signature...')
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    }

    console.log('✅ Webhook verified')
    console.log('📨 Email type:', email_action_type)
    console.log('👤 User email:', user.email)

    let html: string
    let subject: string

    // Escolher template baseado no tipo de ação
    switch (email_action_type) {
      case 'signup':
        console.log('🎉 Rendering signup confirmation email...')
        subject = 'Confirme seu cadastro - Athunna'
        html = await renderAsync(
          React.createElement(ConfirmSignupEmail, {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token_hash,
            email_action_type,
            redirect_to,
            user_email: user.email,
          })
        )
        break

      case 'magiclink':
        console.log('🔗 Rendering magic link email...')
        subject = 'Seu link de acesso - Athunna'
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token,
            token_hash,
            email_action_type,
            redirect_to,
          })
        )
        break

      case 'recovery':
        console.log('🔑 Rendering password reset email...')
        subject = 'Redefinição de senha - Athunna'
        html = await renderAsync(
          React.createElement(ResetPasswordEmail, {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token_hash,
            email_action_type,
            redirect_to,
          })
        )
        break

      default:
        console.log('⚠️ Unknown email type:', email_action_type)
        // Fallback para template de magic link
        subject = 'Athunna - Autenticação'
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token,
            token_hash,
            email_action_type,
            redirect_to,
          })
        )
    }

    console.log('📤 Sending email via Resend...')
    const { data, error } = await resend.emails.send({
      from: 'Athunna <contato@athunna.com>',
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      throw error
    }

    console.log('✅ Email sent successfully:', data?.id)

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
