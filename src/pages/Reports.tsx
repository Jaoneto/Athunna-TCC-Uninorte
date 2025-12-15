
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Download, FileText, Filter, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for reports
const mockReports = [
  {
    id: 1,
    title: "Relatório Mensal - Outubro 2023",
    description: "Resumo das atividades, participações e resultados do mês de Outubro 2023",
    date: "01/11/2023",
    type: "mensal",
    status: "published",
    author: "Carlos Silva",
    division: "todos"
  },
  {
    id: 2,
    title: "Análise de Participação - Q3 2023",
    description: "Análise detalhada da participação e engajamento durante o terceiro trimestre de 2023",
    date: "15/10/2023",
    type: "trimestral",
    status: "published",
    author: "Ana Pereira",
    division: "docentes"
  },
  {
    id: 3,
    title: "Avaliação de Impacto - Semestre 1 2023",
    description: "Avaliação do impacto das atividades realizadas no primeiro semestre de 2023",
    date: "31/07/2023",
    type: "semestral",
    status: "published",
    author: "Roberto Santos",
    division: "aluno_interno"
  },
  {
    id: 4,
    title: "Relatório Mensal - Setembro 2023",
    description: "Resumo das atividades, participações e resultados do mês de Setembro 2023",
    date: "01/10/2023",
    type: "mensal",
    status: "published",
    author: "Carlos Silva",
    division: "aluno_externo"
  },
  {
    id: 5,
    title: "Relatório Anual - 2022",
    description: "Compilação de dados e análise de resultados de todo o ano de 2022",
    date: "15/01/2023",
    type: "anual",
    status: "published",
    author: "Maria Oliveira",
    division: "outros"
  },
  {
    id: 6,
    title: "Relatório Mensal - Novembro 2023",
    description: "Resumo das atividades, participações e resultados do mês de Novembro 2023",
    date: "30/11/2023",
    type: "mensal",
    status: "draft",
    author: "Carlos Silva",
    division: "todos"
  }
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("all");
  const [divisionType, setDivisionType] = useState("all");
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // New report form state
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    type: "mensal",
    division: "todos"
  });
  
  // Handle print functionality
  const handlePrint = (report: typeof mockReports[0]) => {
    setSelectedReport(report);
    setIsPrintDialogOpen(true);
    
    // Wait for dialog to render then print
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Handle download functionality
  const handleDownload = (reportTitle: string) => {
    // In a real app, this would generate a PDF or other file format
    toast.success(`Download iniciado: ${reportTitle}`);
    
    // Simulate a download delay
    setTimeout(() => {
      toast.success(`${reportTitle} baixado com sucesso`);
    }, 1500);
  };

  // Handle new report creation
  const handleNewReport = () => {
    setIsNewReportOpen(true);
  };
  
  // Handle submit new report
  const handleSubmitNewReport = () => {
    if (!newReport.title.trim()) {
      toast.error("Por favor, preencha o título do relatório");
      return;
    }
    
    toast.success(`Relatório "${newReport.title}" criado com sucesso!`);
    setIsNewReportOpen(false);
    setNewReport({
      title: "",
      description: "",
      type: "mensal",
      division: "todos"
    });
  };

  // Filter reports based on search term, type and division
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.author.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesType = reportType === "all" || report.type === reportType;
    
    const matchesDivision = divisionType === "all" || report.division === divisionType;
    
    return matchesSearch && matchesType && matchesDivision;
  });

  // Translate division type to readable text
  const getDivisionLabel = (division: string) => {
    switch(division) {
      case "docentes": return "Docentes";
      case "aluno_interno": return "Alunos Internos";
      case "aluno_externo": return "Alunos Externos";
      case "outros": return "Outros";
      case "todos": 
      default: return "Todos";
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Relatórios</h1>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button className="bg-[#5D5FEF]" onClick={handleNewReport}>
              <FileText size={18} className="mr-2" /> Novo Relatório
            </Button>
          </div>
        </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar relatórios..." 
            className="pl-10 pr-4" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-initial w-full md:w-64">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-initial w-full md:w-64">
          <Select value={divisionType} onValueChange={setDivisionType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por divisão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as divisões</SelectItem>
              <SelectItem value="docentes">Docentes</SelectItem>
              <SelectItem value="aluno_interno">Alunos Internos</SelectItem>
              <SelectItem value="aluno_externo">Alunos Externos</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Divisão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell className="capitalize">{report.type}</TableCell>
                        <TableCell>{getDivisionLabel(report.division)}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.author}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === "published" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {report.status === "published" ? "Publicado" : "Rascunho"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handlePrint(report)}
                            title="Imprimir relatório"
                          >
                            <Printer size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownload(report.title)}
                            title="Baixar relatório"
                          >
                            <Download size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum relatório encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grid">
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === "published" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {report.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <CalendarIcon size={16} className="mr-2" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FileText size={16} className="mr-2" />
                      <span className="capitalize">{report.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Badge variant="outline" className="mr-2">
                        {getDivisionLabel(report.division)}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint(report)}
                    >
                      <Printer size={16} className="mr-2" /> Imprimir
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDownload(report.title)}
                    >
                      <Download size={16} className="mr-2" /> Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-12 text-gray-500 bg-white rounded-lg">
              Nenhum relatório encontrado
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Mensal</CardTitle>
                <CardDescription>
                  Template para relatório mensal com resumo de atividades, participação e resultados.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={handleNewReport}>Usar Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Relatório Trimestral</CardTitle>
                <CardDescription>
                  Template para análise trimestral com gráficos e indicadores de performance.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={handleNewReport}>Usar Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Relatório Anual</CardTitle>
                <CardDescription>
                  Template completo para avaliação anual com todos os indicadores e análises.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={handleNewReport}>Usar Template</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Report Dialog */}
      <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Relatório</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo relatório.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                placeholder="Ex: Relatório Mensal - Janeiro 2024"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o conteúdo do relatório..."
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Relatório</Label>
              <Select value={newReport.type} onValueChange={(value) => setNewReport({ ...newReport, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="division">Divisão</Label>
              <Select value={newReport.division} onValueChange={(value) => setNewReport({ ...newReport, division: value })}>
                <SelectTrigger id="division">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="docentes">Docentes</SelectItem>
                  <SelectItem value="aluno_interno">Alunos Internos</SelectItem>
                  <SelectItem value="aluno_externo">Alunos Externos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitNewReport} className="bg-[#5D5FEF]">
              Criar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <div id="print-content" ref={printRef}>
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedReport?.title}</DialogTitle>
              <DialogDescription className="text-base">
                {selectedReport?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Data</p>
                  <p className="text-base">{selectedReport?.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Autor</p>
                  <p className="text-base">{selectedReport?.author}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Tipo</p>
                  <p className="text-base capitalize">{selectedReport?.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Divisão</p>
                  <p className="text-base">{selectedReport && getDivisionLabel(selectedReport.division)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Status</p>
                  <p className="text-base capitalize">
                    {selectedReport?.status === "published" ? "Publicado" : "Rascunho"}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Conteúdo do Relatório</h3>
                <p className="text-muted-foreground">
                  {selectedReport?.description}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => window.print()}>
              <Printer size={16} className="mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default Reports;
