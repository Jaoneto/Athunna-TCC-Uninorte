
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const participationData = [
  { name: 'Jan', participantes: 65, capacidade: 100 },
  { name: 'Fev', participantes: 70, capacidade: 100 },
  { name: 'Mar', participantes: 80, capacidade: 100 },
  { name: 'Abr', participantes: 75, capacidade: 100 },
  { name: 'Mai', participantes: 90, capacidade: 100 },
  { name: 'Jun', participantes: 85, capacidade: 100 },
];

const activityTypeData = [
  { name: 'Recreativas', value: 35 },
  { name: 'Terapêuticas', value: 25 },
  { name: 'Físicas', value: 20 },
  { name: 'Lúdicas', value: 15 },
  { name: 'Outras', value: 5 },
];

const eventStatusData = [
  { name: 'Jan', concluidos: 12, cancelados: 3, agendados: 5 },
  { name: 'Fev', concluidos: 15, cancelados: 2, agendados: 7 },
  { name: 'Mar', concluidos: 18, cancelados: 4, agendados: 6 },
  { name: 'Abr', concluidos: 16, cancelados: 2, agendados: 8 },
  { name: 'Mai', concluidos: 20, cancelados: 1, agendados: 5 },
  { name: 'Jun', concluidos: 22, cancelados: 3, agendados: 4 },
];

const COLORS = ['#5D5FEF', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6'];

// KPI metrics
const kpiMetrics = [
  { title: "Total de Participantes", value: 235, change: "+12%", changeType: "increase" },
  { title: "Taxa de Participação", value: "85%", change: "+5%", changeType: "increase" },
  { title: "Atividades Realizadas", value: 103, change: "+8%", changeType: "increase" },
  { title: "Taxa de Satisfação", value: "92%", change: "-2%", changeType: "decrease" },
];

const Indicators = () => {
  const [timeRange, setTimeRange] = useState("6m");

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Indicadores</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Período:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">{metric.title}</div>
              <div className="flex items-end mt-2">
                <div className="text-3xl font-bold">{metric.value}</div>
                <div className={`ml-2 text-sm font-medium ${
                  metric.changeType === "increase" ? "text-green-500" : "text-red-500"
                }`}>
                  {metric.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="participation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="participation">Participação</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participation" className="space-y-6">
          {/* Participation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Participação</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={participationData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="participantes" fill="#5D5FEF" name="Participantes" />
                    <Bar dataKey="capacidade" fill="#E5E7EB" name="Capacidade" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Event Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status de Eventos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventStatusData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="concluidos" fill="#34D399" name="Concluídos" />
                    <Bar dataKey="cancelados" fill="#F87171" name="Cancelados" />
                    <Bar dataKey="agendados" fill="#60A5FA" name="Agendados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6">
          {/* Activity Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo de Atividade</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex justify-center">
              <div className="h-80 w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Additional chart could go here */}
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação de Satisfação</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <p className="text-gray-500 mb-8">Os dados de satisfação ainda estão sendo coletados. Visualização disponível em breve.</p>
              <div className="w-full max-w-xs mx-auto p-4 border border-dashed border-gray-300 rounded-md">
                <p className="font-medium">Próxima coleta de feedback: 15/11/2023</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Indicators;
