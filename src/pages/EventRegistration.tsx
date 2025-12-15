import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Validation schema with proper security controls
const registrationSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Nome completo é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .toLowerCase(),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]{8,20}$/, "Telefone deve ter entre 8 e 20 dígitos"),
  division: z.enum(['Alunos Internos', 'Alunos Externos', 'Docentes', 'Outros'], {
    required_error: "Selecione um tipo de vínculo",
  }),
  matricula: z.string()
    .trim()
    .max(50, "Matrícula deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal('')),
  cpf: z.string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos")
    .optional()
    .or(z.literal('')),
  event: z.string()
    .uuid("Selecione um evento válido")
    .min(1, "Evento é obrigatório"),
}).refine(
  (data) => {
    if (data.division === "Alunos Externos") {
      return data.cpf && data.cpf.length === 11;
    }
    return true;
  },
  {
    message: "CPF é obrigatório para alunos externos",
    path: ["cpf"],
  }
).refine(
  (data) => {
    if (data.division === "Alunos Internos" || data.division === "Docentes" || data.division === "Outros") {
      return (data.matricula && data.matricula.length > 0) || (data.cpf && data.cpf.length === 11);
    }
    return true;
  },
  {
    message: "Matrícula ou CPF é obrigatório",
    path: ["matricula"],
  }
);

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface Event {
  id: string;
  titulo: string;
  data_inicio: string;
  capacidade_maxima: number | null;
  vagas_disponiveis: number | null;
}

const EventRegistration = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEvent = searchParams.get('event');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [message, setMessage] = useState('');

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      division: undefined,
      matricula: '',
      cpf: '',
      event: preSelectedEvent || '',
    },
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('id, titulo, data_inicio, capacidade_maxima, vagas_disponiveis')
          .eq('status', 'ativo')
          .gte('data_inicio', new Date().toISOString())
          .order('data_inicio', { ascending: true });

        if (error) {
          console.error('Erro ao buscar eventos:', error);
          setMessage('Erro ao carregar eventos disponíveis');
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (preSelectedEvent) {
      form.setValue('event', preSelectedEvent);
    }
  }, [preSelectedEvent, form]);

  const onSubmit = async (formData: RegistrationFormData) => {
    setMessage('');

    try {
      // Verificar disponibilidade de vagas do evento
      const { data: eventData, error: eventError } = await supabase
        .from('eventos')
        .select('vagas_disponiveis, capacidade_maxima')
        .eq('id', formData.event)
        .single();

      if (eventError) {
        console.error('Erro ao verificar evento:', eventError);
        setMessage('Erro ao verificar disponibilidade do evento');
        return;
      }

      // Verificar se há vagas disponíveis
      if (eventData.capacidade_maxima && eventData.vagas_disponiveis !== null && eventData.vagas_disponiveis <= 0) {
        setMessage('Desculpe, as vagas para este evento já esgotaram');
        return;
      }

      const tipoVinculoMap: { [key: string]: string } = {
        "Alunos Internos": "aluno_interno",
        "Alunos Externos": "aluno_externo", 
        "Docentes": "docente",
        "Outros": "outro"
      };

      // Sanitize inputs before database insertion
      const sanitizedData = {
        nome_completo: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.phone.replace(/\D/g, ''),
        tipo_vinculo: tipoVinculoMap[formData.division],
        matricula: formData.matricula?.trim() || null,
        cpf: formData.cpf?.trim() || null,
        evento_id: formData.event,
      };

      const { data: existingRegistration } = await supabase
        .from('inscricoes_publicas')
        .select('id')
        .eq('email', sanitizedData.email)
        .eq('evento_id', sanitizedData.evento_id)
        .maybeSingle();

      if (existingRegistration) {
        setMessage('Você já está inscrito neste evento');
        return;
      }

      const { error: insertError } = await supabase
        .from('inscricoes_publicas')
        .insert([sanitizedData]);

      if (insertError) {
        console.error('Erro ao realizar inscrição:', insertError);
        setMessage('Erro ao realizar inscrição. Tente novamente.');
        return;
      }

      // Decrementar vagas disponíveis do evento
      if (eventData.capacidade_maxima && eventData.vagas_disponiveis !== null) {
        await supabase
          .from('eventos')
          .update({ vagas_disponiveis: eventData.vagas_disponiveis - 1 })
          .eq('id', formData.event);
      }

      setIsSuccess(true);
      form.reset({
        name: '',
        email: '',
        phone: '',
        division: undefined,
        matricula: '',
        cpf: '',
        event: preSelectedEvent || '',
      });
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setMessage('Erro ao enviar formulário. Tente novamente.');
    }
  };

  const getEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-lg shadow-athunna-xl p-8 max-w-md w-full text-center border border-border">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Inscrição Realizada com Sucesso!
          </h2>
          <p className="text-muted-foreground mb-6">
            Você receberá um e-mail de confirmação em breve com mais detalhes sobre o evento.
          </p>
          <Button
            onClick={() => setIsSuccess(false)}
            className="w-full"
          >
            Fazer Nova Inscrição
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-athunna-xl overflow-hidden border border-border">
          <div className="bg-primary px-6 py-8 text-primary-foreground">
            <h1 className="text-3xl font-bold text-center">
              Inscrição em Evento
            </h1>
            <p className="mt-2 text-center opacity-90">
              Preencha o formulário para se inscrever
            </p>
          </div>

          <div className="px-6 py-8">
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.includes('sucesso') || message.includes('Sucesso')
                  ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {message}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite seu nome completo" 
                          {...field}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com" 
                          {...field}
                          maxLength={255}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="(00) 00000-0000" 
                          {...field}
                          maxLength={20}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingEvents ? "Carregando..." : "Selecione um evento"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.titulo} - {getEventDate(event.data_inicio)}
                              {event.vagas_disponiveis !== null && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({event.vagas_disponiveis} vagas)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vínculo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Alunos Internos">Alunos Internos</SelectItem>
                          <SelectItem value="Alunos Externos">Alunos Externos</SelectItem>
                          <SelectItem value="Docentes">Docentes</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matricula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite sua matrícula" 
                          {...field}
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF {form.watch('division') === 'Alunos Externos' && '*'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Somente números (11 dígitos)" 
                          {...field}
                          maxLength={11}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Processando...' : 'Realizar Inscrição'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
