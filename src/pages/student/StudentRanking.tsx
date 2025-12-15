import React, { useState } from 'react';
import { Trophy, Star, Award, TrendingUp, Medal, Crown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RankingStudent {
  id: string;
  name: string;
  course: string;
  semester: string;
  points: number;
  hoursCompleted: number;
  activitiesCompleted: number;
  position: number;
  badges: string[];
  avatar?: string;
  isCurrentUser?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

const StudentRanking: React.FC = () => {
  const [rankingFilter, setRankingFilter] = useState<string>('geral');
  const [periodFilter, setPeriodFilter] = useState<string>('semestre');
  
  const [currentUser] = useState<RankingStudent>({
    id: 'current',
    name: 'João Silva',
    course: 'Engenharia de Software',
    semester: '6º Semestre',
    points: 850,
    hoursCompleted: 25,
    activitiesCompleted: 8,
    position: 23,
    badges: ['Participativo', 'Dedicado', 'Explorador'],
    isCurrentUser: true
  });

  const [topStudents] = useState<RankingStudent[]>([
    {
      id: '1',
      name: 'Ana Carolina Santos',
      course: 'Ciência da Computação',
      semester: '8º Semestre',
      points: 1450,
      hoursCompleted: 52,
      activitiesCompleted: 15,
      position: 1,
      badges: ['Líder', 'Excepcional', 'Mentor', 'Inovador']
    },
    {
      id: '2',
      name: 'Pedro Henrique Lima',
      course: 'Engenharia de Software',
      semester: '7º Semestre',
      points: 1380,
      hoursCompleted: 48,
      activitiesCompleted: 14,
      position: 2,
      badges: ['Dedicado', 'Participativo', 'Colaborador']
    },
    {
      id: '3',
      name: 'Maria Fernanda Costa',
      course: 'Sistemas de Informação',
      semester: '6º Semestre',
      points: 1290,
      hoursCompleted: 44,
      activitiesCompleted: 13,
      position: 3,
      badges: ['Explorador', 'Consistente', 'Proativo']
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Complete sua primeira atividade',
      icon: '🎯',
      color: 'bg-green-100 text-green-800',
      progress: 1,
      maxProgress: 1,
      unlocked: true
    },
    {
      id: '2',
      title: 'Participativo',
      description: 'Participe de 5 atividades',
      icon: '🎪',
      color: 'bg-blue-100 text-blue-800',
      progress: 5,
      maxProgress: 5,
      unlocked: true
    },
    {
      id: '3',
      title: 'Dedicado',
      description: 'Acumule 20 horas certificadas',
      icon: '⏰',
      color: 'bg-purple-100 text-purple-800',
      progress: 20,
      maxProgress: 20,
      unlocked: true
    },
    {
      id: '4',
      title: 'Explorador',
      description: 'Participe de 3 tipos diferentes de atividades',
      icon: '🧭',
      color: 'bg-orange-100 text-orange-800',
      progress: 3,
      maxProgress: 3,
      unlocked: true
    },
    {
      id: '5',
      title: 'Maratonista',
      description: 'Acumule 50 horas certificadas',
      icon: '🏃‍♂️',
      color: 'bg-red-100 text-red-800',
      progress: 25,
      maxProgress: 50,
      unlocked: false
    },
    {
      id: '6',
      title: 'Mentor',
      description: 'Ajude outros estudantes em 10 atividades',
      icon: '👨‍🏫',
      color: 'bg-indigo-100 text-indigo-800',
      progress: 2,
      maxProgress: 10,
      unlocked: false
    }
  ]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-yellow-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Líder': 'bg-yellow-100 text-yellow-800',
      'Excepcional': 'bg-purple-100 text-purple-800',
      'Mentor': 'bg-blue-100 text-blue-800',
      'Inovador': 'bg-green-100 text-green-800',
      'Dedicado': 'bg-red-100 text-red-800',
      'Participativo': 'bg-indigo-100 text-indigo-800',
      'Colaborador': 'bg-pink-100 text-pink-800',
      'Explorador': 'bg-orange-100 text-orange-800',
      'Consistente': 'bg-teal-100 text-teal-800',
      'Proativo': 'bg-cyan-100 text-cyan-800'
    };
    return colors[badge as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ranking de Participação
        </h1>
        <p className="text-gray-600">
          Acompanhe sua posição e conquiste novas medalhas
        </p>
      </div>

      {/* Current User Position */}
      <div className="bg-gradient-to-r from-[#5D5FEF] to-[#4A4AE3] rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Sua Posição Atual</h2>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
            <Trophy className="w-5 h-5 mr-2" />
            <span className="font-bold">#{currentUser.position}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentUser.points}</div>
            <div className="text-white/80">Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentUser.hoursCompleted}h</div>
            <div className="text-white/80">Horas Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentUser.activitiesCompleted}</div>
            <div className="text-white/80">Atividades</div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-white/80 mb-2">Suas Conquistas:</p>
          <div className="flex flex-wrap gap-2">
            {currentUser.badges.map((badge, index) => (
              <Badge key={index} className="bg-white/20 text-white border-white/30" variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={rankingFilter} onValueChange={setRankingFilter}>
          <SelectTrigger className="w-48">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar ranking" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Ranking Geral</SelectItem>
            <SelectItem value="curso">Por Curso</SelectItem>
            <SelectItem value="semestre">Por Semestre</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-48">
            <TrendingUp className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semestre">Este Semestre</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="ano">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Top Rankings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Top Participantes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                        {getPositionIcon(student.position)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.course} - {student.semester}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.badges.slice(0, 2).map((badge, index) => (
                            <Badge key={index} className={getBadgeColor(badge)} variant="secondary">
                              {badge}
                            </Badge>
                          ))}
                          {student.badges.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{student.points}</div>
                      <div className="text-sm text-gray-600">pontos</div>
                      <div className="text-xs text-gray-500">{student.hoursCompleted}h • {student.activitiesCompleted} atividades</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Conquistas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                            <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'}`}
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className={`${achievement.color} mt-2`} variant="secondary">
                            Desbloqueado!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRanking;
