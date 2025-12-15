import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Shield, UserCog, Download, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UserStats {
  total: number;
  admins: number;
  professors: number;
  students: number;
}

interface TimelineData {
  month: string;
  admins: number;
  professors: number;
  students: number;
  total: number;
}

const UserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    professors: 0,
    students: 0
  });
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('6');
  const [profileFilter, setProfileFilter] = useState('all');
  const [comparePeriod, setComparePeriod] = useState<string | null>(null);
  const [compareStats, setCompareStats] = useState<UserStats | null>(null);
  const { toast } = useToast();

  const COLORS = {
    admins: '#dc2626',
    professors: '#9333ea',
    students: '#16a34a'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data: usuarios, error } = await supabase
          .from('usuarios')
          .select('tipo_perfil, created_at');

        if (error) throw error;

        const counts = {
          total: usuarios?.length || 0,
          admins: usuarios?.filter(u => u.tipo_perfil === 'admin').length || 0,
          professors: usuarios?.filter(u => u.tipo_perfil === 'professor').length || 0,
          students: usuarios?.filter(u => u.tipo_perfil === 'estudante').length || 0
        };

        setStats(counts);

        // Generate timeline data
        const months = parseInt(periodFilter);
        const timeline: TimelineData[] = [];
        
        for (let i = months - 1; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);
          
          const usersInMonth = usuarios?.filter(u => {
            const createdAt = parseISO(u.created_at);
            return createdAt >= monthStart && createdAt <= monthEnd;
          }) || [];

          timeline.push({
            month: format(date, 'MMM/yy', { locale: ptBR }),
            admins: usersInMonth.filter(u => u.tipo_perfil === 'admin').length,
            professors: usersInMonth.filter(u => u.tipo_perfil === 'professor').length,
            students: usersInMonth.filter(u => u.tipo_perfil === 'estudante').length,
            total: usersInMonth.length
          });
        }

        setTimelineData(timeline);

        // Fetch comparison period data if selected
        if (comparePeriod) {
          const compareMonths = parseInt(comparePeriod);
          const compareDate = subMonths(new Date(), compareMonths);
          const compareMonthEnd = endOfMonth(compareDate);
          
          const compareUsersInPeriod = usuarios?.filter(u => {
            const createdAt = parseISO(u.created_at);
            return createdAt <= compareMonthEnd;
          }) || [];

          setCompareStats({
            total: compareUsersInPeriod.length,
            admins: compareUsersInPeriod.filter(u => u.tipo_perfil === 'admin').length,
            professors: compareUsersInPeriod.filter(u => u.tipo_perfil === 'professor').length,
            students: compareUsersInPeriod.filter(u => u.tipo_perfil === 'estudante').length
          });
        } else {
          setCompareStats(null);
        }

      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [periodFilter, profileFilter, comparePeriod, toast]);

  const exportToCSV = async () => {
    try {
      let query = supabase
        .from('usuarios')
        .select('nome_completo, email, tipo_perfil, curso, created_at');

      if (profileFilter !== 'all') {
        query = query.eq('tipo_perfil', profileFilter as 'admin' | 'professor' | 'estudante');
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const csvContent = [
        ['Nome', 'Email', 'Perfil', 'Curso', 'Data de Cadastro'],
        ...(data || []).map(user => [
          user.nome_completo,
          user.email,
          user.tipo_perfil,
          user.curso || 'N/A',
          format(parseISO(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `usuarios_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso"
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    }
  };

  const getFilteredStats = () => {
    if (profileFilter === 'all') return stats;
    return {
      total: stats[profileFilter === 'admin' ? 'admins' : profileFilter === 'professor' ? 'professors' : 'students'],
      admins: profileFilter === 'admin' ? stats.admins : 0,
      professors: profileFilter === 'professor' ? stats.professors : 0,
      students: profileFilter === 'estudante' ? stats.students : 0
    };
  };

  const filteredStats = getFilteredStats();

  const pieData = [
    { name: 'Administradores', value: stats.admins, color: COLORS.admins },
    { name: 'Professores', value: stats.professors, color: COLORS.professors },
    { name: 'Estudantes', value: stats.students, color: COLORS.students }
  ];

  const comparePieData = compareStats ? [
    { name: 'Administradores', value: compareStats.admins, color: COLORS.admins },
    { name: 'Professores', value: compareStats.professors, color: COLORS.professors },
    { name: 'Estudantes', value: compareStats.students, color: COLORS.students }
  ] : [];

  const statsCards = [
    {
      title: "Total de Usuários",
      value: filteredStats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Todos os usuários cadastrados",
      show: profileFilter === 'all'
    },
    {
      title: "Administradores",
      value: filteredStats.admins,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Usuários com acesso total",
      percentage: stats.total > 0 ? ((stats.admins / stats.total) * 100).toFixed(1) : "0",
      show: profileFilter === 'all' || profileFilter === 'admin'
    },
    {
      title: "Professores",
      value: filteredStats.professors,
      icon: UserCog,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Organizadores de eventos",
      percentage: stats.total > 0 ? ((stats.professors / stats.total) * 100).toFixed(1) : "0",
      show: profileFilter === 'all' || profileFilter === 'professor'
    },
    {
      title: "Estudantes",
      value: filteredStats.students,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Participantes de eventos",
      percentage: stats.total > 0 ? ((stats.students / stats.total) * 100).toFixed(1) : "0",
      show: profileFilter === 'all' || profileFilter === 'estudante'
    }
  ].filter(card => card.show);

  const calculateGrowth = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "100.0" : "0.0";
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Estatísticas de Usuários</h1>
          <p className="text-muted-foreground">Visão geral dos usuários cadastrados na plataforma</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="professor">Professores</SelectItem>
              <SelectItem value="estudante">Estudantes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último ano</SelectItem>
              <SelectItem value="24">Últimos 2 anos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={comparePeriod || 'none'} onValueChange={(value) => setComparePeriod(value === 'none' ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Comparar com..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem comparação</SelectItem>
              <SelectItem value="3">3 meses atrás</SelectItem>
              <SelectItem value="6">6 meses atrás</SelectItem>
              <SelectItem value="12">1 ano atrás</SelectItem>
              <SelectItem value="24">2 anos atrás</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`${card.bgColor} p-2 rounded-full`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                    {card.percentage && (
                      <Badge variant="secondary" className="mt-2">
                        {card.percentage}% do total
                      </Badge>
                    )}
                    {profileFilter === 'all' && card.title !== "Total de Usuários" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Distribuição</span>
                          <span>{card.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${card.bgColor} h-2 rounded-full`}
                            style={{ width: `${card.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Growth Cards when comparing */}
          {comparePeriod && compareStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900">Admins</p>
                      <p className="text-2xl font-bold text-red-700">
                        {calculateGrowth(stats.admins, compareStats.admins)}%
                      </p>
                    </div>
                    {parseFloat(calculateGrowth(stats.admins, compareStats.admins)) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-red-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    {compareStats.admins} → {stats.admins}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Professores</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {calculateGrowth(stats.professors, compareStats.professors)}%
                      </p>
                    </div>
                    {parseFloat(calculateGrowth(stats.professors, compareStats.professors)) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    {compareStats.professors} → {stats.professors}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Estudantes</p>
                      <p className="text-2xl font-bold text-green-700">
                        {calculateGrowth(stats.students, compareStats.students)}%
                      </p>
                    </div>
                    {parseFloat(calculateGrowth(stats.students, compareStats.students)) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    {compareStats.students} → {stats.students}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timeline Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Evolução Temporal de Cadastros</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {(profileFilter === 'all' || profileFilter === 'admin') && (
                    <Line 
                      type="monotone" 
                      dataKey="admins" 
                      stroke="#dc2626" 
                      name="Administradores"
                      strokeWidth={2}
                    />
                  )}
                  {(profileFilter === 'all' || profileFilter === 'professor') && (
                    <Line 
                      type="monotone" 
                      dataKey="professors" 
                      stroke="#9333ea" 
                      name="Professores"
                      strokeWidth={2}
                    />
                  )}
                  {(profileFilter === 'all' || profileFilter === 'estudante') && (
                    <Line 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#16a34a" 
                      name="Estudantes"
                      strokeWidth={2}
                    />
                  )}
                  {profileFilter === 'all' && (
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#2563eb" 
                      name="Total"
                      strokeWidth={3}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição Atual de Perfis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {comparePeriod && compareStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição há {comparePeriod} meses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={comparePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {comparePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserStats;
