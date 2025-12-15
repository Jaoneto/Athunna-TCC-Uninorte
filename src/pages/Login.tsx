import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Mail, Lock, UserPlus, Eye, EyeOff, User, RefreshCw, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import athunnaLogo from '@/assets/athunna-logo.png';
import SimpleCaptcha from '@/components/SimpleCaptcha';

const CAPTCHA_THRESHOLD = 3; // Show CAPTCHA after 3 failed attempts
const SECURITY_ALERT_THRESHOLD = 4; // Send email after 4 failed attempts

// Validation schemas
const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .max(100, { message: "Senha muito longa" })
});

const registerSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .max(100, { message: "Senha muito longa" }),
  nome_completo: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" }),
  tipo_perfil: z.enum(['estudante', 'professor'])
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const getLoginAttempts = () => {
  const data = localStorage.getItem('login_attempts');
  if (!data) return { count: 0, lockedUntil: null };
  return JSON.parse(data);
};

const setLoginAttempts = (count: number, lockedUntil: number | null) => {
  localStorage.setItem('login_attempts', JSON.stringify({ count, lockedUntil }));
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isResendEmailOpen, setIsResendEmailOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttemptsState] = useState(() => getLoginAttempts());
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [securityAlertSent, setSecurityAlertSent] = useState(false);
  
  // 2FA states
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pending2FACredentials, setPending2FACredentials] = useState<{ email: string; password: string } | null>(null);
  const [is2FALoading, setIs2FALoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();

  // Check and update lockout status
  useEffect(() => {
    const checkLockout = () => {
      const attempts = getLoginAttempts();
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
        setLockoutRemaining(remaining);
      } else if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
        // Lockout expired, reset attempts
        setLoginAttempts(0, null);
        setLoginAttemptsState({ count: 0, lockedUntil: null });
        setLockoutRemaining(0);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [loginAttempts]);

  const isLockedOut = lockoutRemaining > 0;
  const showCaptcha = loginAttempts.count >= CAPTCHA_THRESHOLD && !isLockedOut;

  // Send security alert email
  const sendSecurityAlert = async (email: string, attemptCount: number) => {
    try {
      const response = await supabase.functions.invoke('send-security-alert', {
        body: {
          email,
          attemptCount,
          timestamp: new Date().toLocaleString('pt-BR', { 
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full',
            timeStyle: 'medium'
          }),
        },
      });

      if (response.error) {
        console.error('Error sending security alert:', response.error);
      } else {
        console.log('Security alert sent successfully');
        setSecurityAlertSent(true);
      }
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  };

  // Log login attempt to database
  const logLoginAttempt = async (email: string, success: boolean, failureReason?: string) => {
    try {
      const currentAttempts = getLoginAttempts();
      await supabase.functions.invoke('log-login-attempt', {
        body: {
          email,
          success,
          attemptCount: currentAttempts.count,
          failureReason,
          lockedUntil: currentAttempts.lockedUntil ? new Date(currentAttempts.lockedUntil).toISOString() : null,
          userAgent: navigator.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  // Send 2FA code
  const send2FACode = async (email: string) => {
    try {
      setIs2FALoading(true);
      const response = await supabase.functions.invoke('send-2fa-code', {
        body: { email },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Código enviado!",
        description: "Verifique seu email para o código de verificação.",
      });
      return true;
    } catch (error: any) {
      console.error('Failed to send 2FA code:', error);
      toast({
        title: "Erro ao enviar código",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIs2FALoading(false);
    }
  };

  // Verify 2FA code
  const verify2FACode = async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await supabase.functions.invoke('verify-2fa-code', {
        body: { email, code },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data?.valid === true;
    } catch (error: any) {
      console.error('Failed to verify 2FA code:', error);
      return false;
    }
  };

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      nome_completo: '',
      tipo_perfil: 'estudante'
    }
  });

  // Redirect if already logged in based on user profile
  useEffect(() => {
    if (!loading && !profileLoading && user && profile) {
      if (profile.tipo_perfil === 'estudante') {
        navigate('/student');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, profile, profileLoading, navigate]);

  const handleSubmit = async (data: LoginFormData) => {
    // Check if locked out
    if (isLockedOut) {
      toast({
        title: "Acesso bloqueado",
        description: `Aguarde ${formatLockoutTime(lockoutRemaining)} para tentar novamente.`,
        variant: "destructive",
      });
      return;
    }

    // Check CAPTCHA if required
    if (showCaptcha && !captchaVerified) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete a verificação de segurança.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // First, verify credentials without completing login
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      // Log failed attempt
      await logLoginAttempt(data.email, false, error.message);
      
      // Increment failed attempts
      const currentAttempts = getLoginAttempts();
      const newCount = currentAttempts.count + 1;
      
      // Send security alert at threshold
      if (newCount === SECURITY_ALERT_THRESHOLD && !securityAlertSent) {
        sendSecurityAlert(data.email, newCount);
      }
      
      if (newCount >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        setLoginAttempts(newCount, lockedUntil);
        setLoginAttemptsState({ count: newCount, lockedUntil });
        setCaptchaVerified(false);
        toast({
          title: "Muitas tentativas incorretas",
          description: "Seu acesso foi bloqueado por 5 minutos por segurança.",
          variant: "destructive",
        });
      } else {
        setLoginAttempts(newCount, null);
        setLoginAttemptsState({ count: newCount, lockedUntil: null });
        setCaptchaVerified(false); // Reset CAPTCHA on each attempt
        const remaining = MAX_LOGIN_ATTEMPTS - newCount;
        toast({
          title: "Credenciais inválidas",
          description: `Você tem mais ${remaining} tentativa${remaining > 1 ? 's' : ''} antes do bloqueio.`,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    } else {
      // Check if 2FA is required (only for security risks or password recovery)
      const currentAttempts = getLoginAttempts();
      const hasSecurityRisk = currentAttempts.count > 0 || securityAlertSent;
      const isPasswordRecovery = localStorage.getItem('password_recovery_pending') === 'true';
      
      if (hasSecurityRisk || isPasswordRecovery) {
        // 2FA required - sign out temporarily to complete 2FA flow
        await supabase.auth.signOut();
        
        setPending2FACredentials({ email: data.email, password: data.password });
        const sent = await send2FACode(data.email);
        
        if (sent) {
          setShow2FADialog(true);
        }
        setIsSubmitting(false);
      } else {
        // No security risk - complete login directly
        await logLoginAttempt(data.email, true);
        setLoginAttempts(0, null);
        setLoginAttemptsState({ count: 0, lockedUntil: null });
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        setIsSubmitting(false);
      }
    }
  };

  const handle2FAVerification = async () => {
    if (!pending2FACredentials || !twoFactorCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, insira o código de verificação.",
        variant: "destructive",
      });
      return;
    }

    setIs2FALoading(true);

    const isValid = await verify2FACode(pending2FACredentials.email, twoFactorCode);

    if (isValid) {
      // Complete login
      const { error } = await signIn(pending2FACredentials.email, pending2FACredentials.password);
      
      if (!error) {
        // Log successful login
        await logLoginAttempt(pending2FACredentials.email, true);
        
        // Reset attempts and security flags on successful login
        setLoginAttempts(0, null);
        setLoginAttemptsState({ count: 0, lockedUntil: null });
        setCaptchaVerified(false);
        setSecurityAlertSent(false);
        localStorage.removeItem('password_recovery_pending');
        setShow2FADialog(false);
        setTwoFactorCode('');
        setPending2FACredentials(null);
        
        toast({
          title: "Login realizado!",
          description: "Autenticação de dois fatores concluída.",
        });
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Código inválido",
        description: "O código informado está incorreto ou expirou.",
        variant: "destructive",
      });
      setTwoFactorCode('');
    }

    setIs2FALoading(false);
  };

  const handleResend2FACode = async () => {
    if (pending2FACredentials) {
      await send2FACode(pending2FACredentials.email);
    }
  };

  const handleCancel2FA = () => {
    setShow2FADialog(false);
    setTwoFactorCode('');
    setPending2FACredentials(null);
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleRegister = async (data: RegisterFormData) => {
    const userData = {
      nome_completo: data.nome_completo,
      tipo_perfil: data.tipo_perfil,
    };

    const { error } = await signUp(data.email, data.password, userData);
    if (!error) {
      setIsRegisterOpen(false);
      registerForm.reset();
      toast({
        title: "Cadastro realizado!",
        description: "Você já pode fazer login com suas credenciais.",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      // Mark that user is recovering password (will require 2FA on next login)
      localStorage.setItem('password_recovery_pending', 'true');
      
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para reenviar a confirmação.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada para confirmar seu cadastro.",
      });
      setIsResendEmailOpen(false);
      setResendEmail('');
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 p-4">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <Card className="w-full glass-card shadow-athunna-xl border-border/50">
          <CardHeader className="flex flex-col items-center space-y-1 pb-2">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-2 border-2 border-primary/20 backdrop-blur-sm p-2">
              <img src={athunnaLogo} alt="Logo Athunna" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Athunna</CardTitle>
            <p className="text-sm text-muted-foreground">Faça login para continuar</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isLockedOut && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  Acesso bloqueado por tentativas excessivas. Tente novamente em <strong>{formatLockoutTime(lockoutRemaining)}</strong>.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={loginForm.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    {...loginForm.register('email')}
                    className="pl-10 h-12 text-base border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Label htmlFor="password" className="sr-only">Senha</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha (mín. 8 caracteres)"
                    {...loginForm.register('password')}
                    className="pl-10 pr-10 h-12 text-base border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-primary/70 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              {showCaptcha && (
                <SimpleCaptcha 
                  onVerify={setCaptchaVerified} 
                  isVerified={captchaVerified} 
                />
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium shadow-athunna-sm hover:shadow-athunna-lg transition-all duration-300"
                disabled={isLockedOut || (showCaptcha && !captchaVerified)}
              >
                {isLockedOut ? `Bloqueado (${formatLockoutTime(lockoutRemaining)})` : 'Entrar'}
              </Button>
            </form>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={() => setIsResendEmailOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Reenviar confirmação
              </button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="w-full border-t border-border/50 my-2"></div>
            <Button
              onClick={() => setIsRegisterOpen(true)}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-primary hover:bg-accent/50 transition-athunna"
            >
              <UserPlus className="h-5 w-5" />
              Novo usuário? Registre-se
            </Button>
          </CardFooter>
        </Card>
        
        {/* Registration dialog */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar nova conta</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para criar sua conta
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome completo</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    {...registerForm.register('nome_completo')}
                    className="pl-10"
                  />
                </div>
                {registerForm.formState.errors.nome_completo && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.nome_completo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    {...registerForm.register('email')}
                    className="pl-10"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Crie uma senha (mín. 8 caracteres)"
                    {...registerForm.register('password')}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleRegisterPasswordVisibility}
                    className="absolute right-3 top-3 text-primary/70 hover:text-primary transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-role">Tipo de usuário</Label>
                <select
                  id="register-role"
                  {...registerForm.register('tipo_perfil')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="estudante">Estudante</option>
                  <option value="professor">Professor</option>
                </select>
                {registerForm.formState.errors.tipo_perfil && (
                  <p className="text-sm text-red-500">{registerForm.formState.errors.tipo_perfil.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Forgot Password Dialog */}
        <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Recuperar senha</DialogTitle>
              <DialogDescription>
                Informe seu email para receber o link de redefinição de senha.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotPasswordOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar link"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resend Confirmation Email Dialog */}
        <Dialog open={isResendEmailOpen} onOpenChange={setIsResendEmailOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Reenviar email de confirmação
              </DialogTitle>
              <DialogDescription>
                Se você não recebeu o email de confirmação de cadastro, informe seu email para reenviarmos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-primary/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResendEmailOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleResendConfirmation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Reenviar email"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2FA Verification Dialog */}
        <Dialog open={show2FADialog} onOpenChange={(open) => !open && handleCancel2FA()}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Verificação em Duas Etapas
              </DialogTitle>
              <DialogDescription>
                Enviamos um código de 6 dígitos para seu email. Insira o código abaixo para continuar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="2fa-code">Código de Verificação</Label>
                <Input
                  id="2fa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleResend2FACode}
                  disabled={is2FALoading}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors disabled:opacity-50"
                >
                  Não recebeu? Reenviar código
                </button>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel2FA}
                  disabled={is2FALoading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handle2FAVerification}
                  disabled={is2FALoading || twoFactorCode.length !== 6}
                >
                  {is2FALoading ? "Verificando..." : "Verificar"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
