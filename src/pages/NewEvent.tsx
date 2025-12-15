
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, Upload, X } from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// Expanded form schema with more specific fields
const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título precisa ter pelo menos 2 caracteres.",
  }),
  type: z.enum(['workshop', 'minicourse', 'activity'], {
    required_error: "Por favor selecione um tipo de evento.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  startTime: z.string().min(1, {
    message: "O horário de início é obrigatório.",
  }),
  endTime: z.string().min(1, {
    message: "O horário de término é obrigatório.",
  }),
  location: z.string().min(3, {
    message: "O local precisa ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição precisa ter pelo menos 10 caracteres.",
  }),
  capacity: z.string().min(1, {
    message: "Informe a capacidade do evento.",
  }),
  targetAudience: z.string().min(1, {
    message: "Informe o público-alvo do evento.",
  }),
  prerequisites: z.string().optional(),
  expectedResults: z.string().min(1, {
    message: "Informe os resultados esperados do evento.",
  }),
  resources: z.string().optional(),
});

const NewEvent: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      capacity: "",
      startTime: "",
      endTime: "",
      targetAudience: "",
      prerequisites: "",
      expectedResults: "",
      resources: "",
    },
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Remove file from uploaded files
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here we would normally upload the files to a storage service
    // and save the URLs in the database along with the form data
    
    const eventData = {
      ...values,
      files: uploadedFiles.map(file => file.name) // In a real app, this would be URLs to the uploaded files
    };
    
    console.log(eventData);
    
    toast({
      title: "Evento cadastrado com sucesso!",
      description: "O evento foi adicionado à programação.",
    });
    
    setTimeout(() => navigate('/events'), 1500);
  }

  return (
    <div className="min-h-screen bg-[#F7F7FC] flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <Link to="/events">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Cadastrar Novo Evento</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto max-w-4xl py-6 px-4">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Oficina de Artes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Evento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="workshop" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Oficina
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="minicourse" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Minicurso
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="activity" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Atividade
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto p-3"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 20 pessoas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Público-alvo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Estudantes do ensino médio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Laboratório de Informática" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o evento..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pré-requisitos</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conhecimentos ou materiais necessários..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expectedResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultados Esperados</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="O que os participantes deverão aprender ou produzir..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recursos Necessários</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Equipamentos, materiais ou recursos que serão utilizados..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <FormLabel>Fotos e Vídeos</FormLabel>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Selecionar Arquivos</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </label>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" type="button" className="text-sm" disabled={uploadedFiles.length === 0}>
                          Ver {uploadedFiles.length} arquivo(s)
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Arquivos Selecionados</SheetTitle>
                          <SheetDescription>
                            Estes arquivos serão enviados ao cadastrar o evento.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-8 space-y-4">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                                  {file.type.startsWith('image/') ? (
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={file.name} 
                                      className="w-10 h-10 object-cover rounded-md"
                                    />
                                  ) : (
                                    <video 
                                      className="w-10 h-10 object-cover rounded-md"
                                    >
                                      <source src={URL.createObjectURL(file)} />
                                    </video>
                                  )}
                                </div>
                                <div className="text-sm truncate max-w-[200px]">{file.name}</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeFile(index)}
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adicione fotos ou vídeos relacionados ao evento.
                  </p>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="w-full sm:w-auto bg-[#5D5FEF] hover:bg-[#4A4AE3]">
                  Cadastrar Evento
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default NewEvent;
