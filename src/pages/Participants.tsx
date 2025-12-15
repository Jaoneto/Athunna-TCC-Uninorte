import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, ExternalLink } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

interface EventRegistration {
  id: string;
  evento_id: string;
  data_inscricao: string;
  status: string;
  usuarios: {
    id: string;
    nome_completo: string;
    email: string;
    telefone: string | null;
    tipo_perfil: string;
  };
  eventos: {
    titulo: string;
  };
}

const Participants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data, error } = await supabase
          .from('inscricoes_eventos')
          .select(`
            *,
            usuarios (
              id,
              nome_completo,
              email,
              telefone,
              tipo_perfil
            ),
            eventos (
              titulo
            )
          `)
          .order('data_inscricao', { ascending: false });

        if (error) throw error;
        setRegistrations(data || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(reg =>
    reg.usuarios?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.usuarios?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.eventos?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Participantes de Eventos</h1>
          <p className="text-muted-foreground">Gerencie inscrições em eventos</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar por nome, email..." 
              className="pl-10 pr-4 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/event-registration" target="_blank">
            <Button className="bg-[#5D5FEF] flex items-center gap-2">
              <UserPlus size={18} />
              Formulário de Inscrição
              <ExternalLink size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Inscrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando participantes...
                    </TableCell>
                  </TableRow>
                ) : filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.usuarios?.nome_completo || '-'}</TableCell>
                      <TableCell>{reg.usuarios?.email || '-'}</TableCell>
                      <TableCell>{reg.usuarios?.telefone || '-'}</TableCell>
                      <TableCell>{reg.eventos?.titulo || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          reg.status === 'confirmada' ? 'default' :
                          reg.status === 'cancelada' ? 'destructive' :
                          'secondary'
                        }>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(reg.data_inscricao).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma inscrição encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Participants;
