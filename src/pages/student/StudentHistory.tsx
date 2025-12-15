import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  BookOpen, 
  Users,
  Search,
  Download,
  Star,
  CheckCircle2,
  Eye,
  Mic
} from 'lucide-react';
import { useCertificates, CertificateData } from '@/hooks/useCertificates';
import { useStudentHistory } from '@/hooks/useStudentHistory';
import { CertificateViewDialog } from '@/components/CertificateViewDialog';
import { ShareCertificateDialog } from '@/components/ShareCertificateDialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

const StudentHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const { data: certificates = [] } = useCertificates();
  const { data: historyData, isLoading } = useStudentHistory();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const items = historyData?.items || [];
  const totalHours = historyData?.totalHours || 0;
  const completedCount = historyData?.completedCount || 0;
  const certificatesCount = historyData?.certificatesCount || 0;
  const averageRating = historyData?.averageRating || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'oficina': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'palestra': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'evento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'workshop': return 'Workshop';
      case 'oficina': return 'Oficina';
      case 'palestra': return 'Palestra';
      case 'evento': return 'Evento';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return <BookOpen className="w-5 h-5 text-primary" />;
      case 'oficina': return <Users className="w-5 h-5 text-primary" />;
      case 'palestra': return <Mic className="w-5 h-5 text-primary" />;
      case 'evento': return <Calendar className="w-5 h-5 text-primary" />;
      default: return <BookOpen className="w-5 h-5 text-primary" />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'completed' && item.status === 'completed') ||
                      (selectedTab === 'in-progress' && item.status === 'in-progress') ||
                      (selectedTab === 'certificates' && item.certificateId);
    return matchesSearch && matchesTab;
  });

  const handleViewCertificate = (item: typeof items[0]) => {
    const cert = certificates.find(c => c.id === item.certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      setViewDialogOpen(true);
    } else {
      toast({
        title: 'Certificado não encontrado',
        description: 'Este certificado ainda não está disponível.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Histórico de Participações
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e conquistas acadêmicas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Atividades Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalHours}h</p>
                <p className="text-sm text-muted-foreground">Horas Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{certificatesCount}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{averageRating > 0 ? averageRating : '-'}</p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar atividades ou instrutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Histórico
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
            <TabsTrigger value="certificates">Com Certificado</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {getTypeLabel(item.type)}
                        </Badge>
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status === 'completed' ? 'Concluído' :
                           item.status === 'in-progress' ? 'Em Andamento' : 'Ausente'}
                        </Badge>
                        {item.certificateId && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" variant="secondary">
                            <Award className="w-3 h-3 mr-1" />
                            Certificado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(item.date).toLocaleDateString('pt-BR')} • {item.duration}h
                        </div>
                        {(item.location || item.instructor) && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {[item.location, item.instructor].filter(Boolean).join(' • ')}
                          </div>
                        )}
                        {item.status === 'completed' && (
                          <div className="flex items-center text-green-600">
                            <Clock className="w-4 h-4 mr-2" />
                            +{item.complementaryHours}h de carga horária
                          </div>
                        )}
                      </div>
                      
                      {item.rating && (
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-muted-foreground mr-2">Sua avaliação:</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.rating! ? 'text-yellow-400 fill-current' : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 lg:w-auto w-full">
                  {item.certificateId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCertificate(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Certificado
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-muted-foreground">
            {items.length === 0 
              ? 'Você ainda não participou de nenhuma atividade ou evento.'
              : 'Tente ajustar os filtros ou termos de busca'}
          </p>
        </div>
      )}
      
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

export default StudentHistory;
