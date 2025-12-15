import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { ATHUNNA_LOGO_BASE64 } from '../_shared/logo-base64.ts'

interface MagicLinkEmailProps {
  supabase_url: string
  token_hash: string
  email_action_type: string
  redirect_to: string
  token: string
}

export const MagicLinkEmail = ({
  supabase_url,
  token_hash,
  email_action_type,
  redirect_to,
  token,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu link de acesso à plataforma Athunna</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={ATHUNNA_LOGO_BASE64}
            width="160"
            height="40"
            alt="Athunna"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Acesso à Plataforma</Heading>
        
        <Text style={text}>
          Você solicitou acesso à plataforma Athunna. Clique no botão abaixo para fazer login:
        </Text>
        
        <Section style={buttonContainer}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            target="_blank"
            style={button}
          >
            Acessar Plataforma
          </Link>
        </Section>
        
        <Text style={text}>
          Ou copie e cole este código temporário de login:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>
        
        <Text style={textMuted}>
          Este link é válido por 1 hora e pode ser usado apenas uma vez.
        </Text>
        
        <Text style={textMuted}>
          Se você não solicitou este acesso, pode ignorar este email com segurança.
        </Text>
        
        <Section style={divider} />
        
        <Text style={footer}>
          Athunna - Plataforma de Gestão de Eventos Acadêmicos
          <br />
          Este é um email automático, por favor não responda.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f6f7fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '12px',
  maxWidth: '600px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const textMuted = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5d66d1',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const codeContainer = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const code = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: '600',
  letterSpacing: '2px',
  margin: '0',
  fontFamily: 'monospace',
}

const divider = {
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
}

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
