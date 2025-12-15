import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Edit, Trash2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Institution {
  id: string;
  nome: string;
  sigla: string | null;
  tipo: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  endereco: string | null;
  website: string | null;
  contato_email: string | null;
  contato_telefone: string | null;
  created_at: string;
  updated_at: string;
}

const Institutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    tipo: '',
    cidade: '',
    estado: '',
    endereco: '',
    website: '',
    contato_email: '',
    contato_telefone: '',
  });

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instituicoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as instituições.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da instituição é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingInstitution) {
        const { error } = await supabase
          .from('instituicoes')
          .update(formData)
          .eq('id', editingInstitution.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Instituição atualizada com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('instituicoes')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Instituição criada com sucesso!',
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchInstitutions();
    } catch (error) {
      console.error('Erro ao salvar instituição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a instituição.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setFormData({
      nome: institution.nome,
      sigla: institution.sigla || '',
      tipo: institution.tipo || '',
      cidade: institution.cidade || '',
      estado: institution.estado || '',
      endereco: institution.endereco || '',
      website: institution.website || '',
      contato_email: institution.contato_email || '',
      contato_telefone: institution.contato_telefone || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instituicoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Instituição excluída com sucesso!',
      });

      fetchInstitutions();
    } catch (error) {
      console.error('Erro ao excluir instituição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a instituição.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      sigla: '',
      tipo: '',
      cidade: '',
      estado: '',
      endereco: '',
      website: '',
      contato_email: '',
      contato_telefone: '',
    });
    setEditingInstitution(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const filteredInstitutions = institutions.filter(institution =>
    institution.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Instituições</h1>
            <p className="text-muted-foreground">Gerencie as instituições do sistema</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Instituição</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingInstitution ? 'Editar Instituição' : 'Nova Instituição'}
              </DialogTitle>
              <DialogDescription>
                {editingInstitution 
                  ? 'Edite as informações da instituição.'
                  : 'Preencha os campos para criar uma nova instituição.'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Instituição *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome da instituição"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Ex: UFT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: Universidade, Escola, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.site.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato_email">E-mail de Contato</Label>
                <Input
                  id="contato_email"
                  type="email"
                  value={formData.contato_email}
                  onChange={(e) => setFormData({ ...formData, contato_email: e.target.value })}
                  placeholder="contato@instituicao.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato_telefone">Telefone de Contato</Label>
                <Input
                  id="contato_telefone"
                  value={formData.contato_telefone}
                  onChange={(e) => setFormData({ ...formData, contato_telefone: e.target.value })}
                  placeholder="(11) 9999-9999"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingInstitution ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Instituições Cadastradas ({filteredInstitutions.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar instituições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando instituições...</p>
            </div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma instituição encontrada.' : 'Nenhuma instituição cadastrada ainda.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstitutions.map((institution) => (
                <Card key={institution.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{institution.nome}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {institution.sigla && (
                            <p><strong>Sigla:</strong> {institution.sigla}</p>
                          )}
                          {institution.tipo && (
                            <p><strong>Tipo:</strong> {institution.tipo}</p>
                          )}
                          {institution.cidade && institution.estado && (
                            <p><strong>Localização:</strong> {institution.cidade} - {institution.estado}</p>
                          )}
                          {institution.contato_email && (
                            <p><strong>E-mail:</strong> {institution.contato_email}</p>
                          )}
                          {institution.contato_telefone && (
                            <p><strong>Telefone:</strong> {institution.contato_telefone}</p>
                          )}
                          {institution.website && (
                            <p><strong>Website:</strong> <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{institution.website}</a></p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(institution)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a instituição "{institution.nome}"? 
                                Esta ação não pode ser revertida.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(institution.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Institutions;