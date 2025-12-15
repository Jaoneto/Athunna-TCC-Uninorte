import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { ATHUNNA_LOGO_BASE64 } from '../_shared/logo-base64.ts'

interface WelcomeAdminEmailProps {
  admin_name: string
}

export const WelcomeAdminEmail = ({
  admin_name,
}: WelcomeAdminEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Athunna - Acesso Administrativo</Preview>
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
        
        <Heading style={h1}>Bem-vindo ao Athunna!</Heading>
        
        <Text style={text}>
          Olá <strong>{admin_name}</strong>,
        </Text>
        
        <Text style={text}>
          É com grande satisfação que te damos as boas-vindas à plataforma Athunna! 
          Você foi adicionado como administrador do sistema.
        </Text>
        
        <Text style={text}>
          Como administrador, você terá acesso completo às funcionalidades da plataforma, 
          incluindo gerenciamento de eventos, usuários, instituições e muito mais.
        </Text>
        
        <Section style={highlightBox}>
          <Text style={highlightText}>
            🎯 Você já pode acessar a plataforma com as credenciais fornecidas no cadastro.
          </Text>
        </Section>
        
        <Text style={text}>
          Estamos animados para tê-lo em nossa equipe!
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

export default WelcomeAdminEmail

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

const highlightBox = {
  backgroundColor: '#f0f9ff',
  borderLeft: '4px solid #5d66d1',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const highlightText = {
  color: '#1e40af',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
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
