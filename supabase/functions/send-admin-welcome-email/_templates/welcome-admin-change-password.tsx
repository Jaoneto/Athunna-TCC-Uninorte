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

interface WelcomeAdminChangePasswordEmailProps {
  admin_name: string
  email: string
  temporary_password: string
}

export const WelcomeAdminChangePasswordEmail = ({
  admin_name,
  email,
  temporary_password,
}: WelcomeAdminChangePasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Athunna - Troque sua senha</Preview>
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
        
        <Section style={warningBox}>
          <Text style={warningText}>
            ⚠️ <strong>Importante - Altere sua senha!</strong>
            <br /><br />
            Por questões de segurança, você precisa trocar sua senha temporária 
            no primeiro acesso à plataforma.
          </Text>
        </Section>
        
        <Section style={credentialsBox}>
          <Text style={credentialsTitle}>Suas credenciais de acesso:</Text>
          <Text style={credentialsText}>
            <strong>Email:</strong> {email}
            <br />
            <strong>Senha temporária:</strong> <code style={code}>{temporary_password}</code>
          </Text>
        </Section>
        
        <Text style={text}>
          Após fazer login, você será direcionado para alterar sua senha. 
          Como administrador, você terá acesso completo às funcionalidades da plataforma, 
          incluindo gerenciamento de eventos, usuários, instituições e muito mais.
        </Text>
        
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

export default WelcomeAdminChangePasswordEmail

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

const warningBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const credentialsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const credentialsTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const credentialsText = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const code = {
  backgroundColor: '#f1f5f9',
  padding: '4px 8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#5d66d1',
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
