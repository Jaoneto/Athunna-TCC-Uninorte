import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, Users, Filter, ExternalLink, Eye, Loader2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PublicRegistration {
  id: string;
  evento_id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  tipo_vinculo: string;
  matricula: string | null;
  cpf_masked: string | null;
  status: string;
  data_inscricao: string;
  created_at: string;
}

interface Event {
  id: string;
  titulo: string;
}

const ParticipantsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<PublicRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [cpfDialogOpen, setCpfDialogOpen] = useState(false);
  const [selectedCpfId, setSelectedCpfId] = useState<string | null>(null);
  const [fullCpf, setFullCpf] = useState<string | null>(null);
  const [loadingCpf, setLoadingCpf] = useState(false);

  const divisions = ["Docentes", "Alunos Internos", "Alunos Externos", "Outros"];

  // Fetch registrations using audited function
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events for the filter dropdown
        const { data: eventsData, error: eventsError } = await supabase
          .from('eventos')
          .select('id, titulo')
          .order('titulo');
        
        if (eventsError) throw eventsError;
        setEvents(eventsData || []);

        // Fetch registrations using the audited function
        const { data, error } = await supabase.rpc('get_inscricoes_publicas_audited');
        
        if (error) {
          if (error.message.includes('Acesso negado')) {
            toast.error('Acesso negado: apenas administradores podem ver inscrições públicas');
          } else {
            throw error;
          }
          return;
        }
        
        setRegistrations(data || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Erro ao carregar inscrições');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle viewing full CPF (audited)
  const handleViewFullCpf = async (inscricaoId: string) => {
    setSelectedCpfId(inscricaoId);
    setCpfDialogOpen(true);
    setLoadingCpf(true);
    setFullCpf(null);
    
    try {
      const { data, error } = await supabase.rpc('get_cpf_full_audited', {
        _inscricao_id: inscricaoId
      });
      
      if (error) {
        if (error.message.includes('Acesso negado')) {
          toast.error('Acesso negado: apenas administradores podem ver CPF completo');
        } else {
          throw error;
        }
        setCpfDialogOpen(false);
        return;
      }
      
      setFullCpf(data);
    } catch (error) {
      console.error('Error fetching full CPF:', error);
      toast.error('Erro ao carregar CPF');
      setCpfDialogOpen(false);
    } finally {
      setLoadingCpf(false);
    }
  };

  const getEventTitle = (eventoId: string) => {
    const event = events.find(e => e.id === eventoId);
    return event?.titulo || 'Evento não encontrado';
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === "all" || reg.tipo_vinculo === selectedDivision;
    const matchesEvent = selectedEvent === "all" || reg.evento_id === selectedEvent;
    
    return matchesSearch && matchesDivision && matchesEvent;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants(filteredRegistrations.map(p => p.id));
    } else {
      setSelectedParticipants([]);
    }
  };

  const handleSelectParticipant = (participantId: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipants([...selectedParticipants, participantId]);
    } else {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    }
  };

  const handleExportPDF = () => {
    const selectedData = filteredRegistrations.filter(p => 
      selectedParticipants.length === 0 || selectedParticipants.includes(p.id)
    );
    
    console.log("Exportando PDF com dados:", selectedData);
    toast.success(`Exportando PDF com ${selectedData.length} participantes selecionados.`);
  };

  const formatCpf = (cpf: string | null) => {
    if (!cpf) return '-';
    // Format CPF: XXX.XXX.XXX-XX
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    }
    return cpf;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Lista de Participantes</h1>
          <p className="text-muted-foreground">Gerencie e exporte listas de participantes por evento</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/event-registration" target="_blank">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink size={16} />
              Formulário de Inscrição
            </Button>
          </Link>
          <Button 
            onClick={handleExportPDF}
            className="bg-primary"
            disabled={filteredRegistrations.length === 0}
          >
            <Download size={18} className="mr-2" />
            Exportar PDF ({selectedParticipants.length || filteredRegistrations.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Buscar por nome ou email..." 
                className="pl-10 pr-4" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por divisão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as divisões</SelectItem>
                {divisions.map(division => (
                  <SelectItem key={division} value={division}>{division}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{filteredRegistrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {divisions.map(division => (
          <Card key={division}>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">{division}</p>
                <p className="text-xl font-bold">
                  {filteredRegistrations.filter(p => p.tipo_vinculo === division).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Participants Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedParticipants.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Carregando participantes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedParticipants.includes(reg.id)}
                          onCheckedChange={(checked) => handleSelectParticipant(reg.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{reg.nome_completo}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.telefone}</TableCell>
                      <TableCell>{reg.matricula || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{reg.cpf_masked || '-'}</span>
                          {reg.cpf_masked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleViewFullCpf(reg.id)}
                              title="Ver CPF completo"
                            >
                              <Eye size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {reg.tipo_vinculo}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{getEventTitle(reg.evento_id)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reg.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                          reg.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum participante encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CPF Full View Dialog */}
      <Dialog open={cpfDialogOpen} onOpenChange={setCpfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>CPF Completo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingCpf ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Carregando...</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{formatCpf(fullCpf)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Este acesso foi registrado na auditoria de dados sensíveis.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsList;
