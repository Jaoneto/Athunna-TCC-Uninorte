import React, { useState } from 'react';
import { Eye, Share2, Calendar, Award, Hash, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCertificates, CertificateData } from '@/hooks/useCertificates';
import { CertificateViewDialog } from '@/components/CertificateViewDialog';
import { ShareCertificateDialog } from '@/components/ShareCertificateDialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentCertificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const { data: certificates = [], isLoading } = useCertificates();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const filteredCertificates = certificates.filter(cert => {
    const title = cert.evento?.titulo || cert.atividade?.titulo || '';
    const eventType = cert.tipo.toLowerCase();
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.codigo_verificacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || eventType.includes(typeFilter);
    const certYear = new Date(cert.data_emissao).getFullYear().toString();
    const matchesYear = yearFilter === 'all' || certYear === yearFilter;
    
    return matchesSearch && matchesType && matchesYear;
  });

  const totalHours = certificates.reduce((sum, cert) => sum + (cert.carga_horaria || 0), 0);

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('palestra')) return 'bg-blue-100 text-blue-800';
    if (lowerType.includes('oficina')) return 'bg-green-100 text-green-800';
    if (lowerType.includes('workshop')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleView = (certificate: CertificateData) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  const handleShare = async (certificate: CertificateData) => {
    setSelectedCertificate(certificate);
    setShareDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meus Certificados
        </h1>
        <p className="text-gray-600">
          Gerencie e compartilhe seus certificados digitais
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Certificados</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : certificates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Horas</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Certificados Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar certificados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="palestra">Palestras</SelectItem>
                <SelectItem value="oficina">Oficinas</SelectItem>
                <SelectItem value="atividade">Atividades</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Certificados Disponíveis
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando certificados...
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum certificado encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((certificate) => {
                const title = certificate.evento?.titulo || certificate.atividade?.titulo || 'Atividade';
                const instructor = certificate.atividade?.palestrante || 'Instrutor';
                
                return (
                  <div key={certificate.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {instructor}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={getTypeColor(certificate.tipo)} variant="secondary">
                                {certificate.tipo}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800" variant="secondary">
                                Ativo
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                {certificate.carga_horaria}h certificadas
                              </div>
                              <div className="flex items-center">
                                <Hash className="w-4 h-4 mr-1" />
                                {certificate.codigo_verificacao}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(certificate)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShare(certificate)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <CertificateViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        certificate={selectedCertificate}
        studentName={profile?.nome_completo || 'Estudante'}
      />
      
      <ShareCertificateDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        certificate={selectedCertificate}
        studentName={profile?.nome_completo || 'Estudante'}
      />
    </div>
  );
};

export default StudentCertificates;
