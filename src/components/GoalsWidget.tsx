import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  CheckCircle,
  Clock
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  category: 'adocoes' | 'voluntarios' | 'financeiro' | 'animais' | 'geral';
  priority: 'alta' | 'media' | 'baixa';
  status: 'em_progresso' | 'concluida' | 'atrasada' | 'pausada';
}

interface GoalsWidgetProps {
  goals: Goal[];
  title?: string;
}

const GoalsWidget: React.FC<GoalsWidgetProps> = ({ 
  goals, 
  title = "Metas e Objetivos" 
}) => {
  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'adocoes': return 'text-green-600 bg-green-100';
      case 'voluntarios': return 'text-purple-600 bg-purple-100';
      case 'financeiro': return 'text-emerald-600 bg-emerald-100';
      case 'animais': return 'text-blue-600 bg-blue-100';
      case 'geral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case 'concluida': return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'em_progresso': return <TrendingUp className={`${iconClass} text-blue-600`} />;
      case 'atrasada': return <Clock className={`${iconClass} text-red-600`} />;
      case 'pausada': return <Clock className={`${iconClass} text-gray-600`} />;
      default: return <Target className={`${iconClass} text-gray-600`} />;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} dias em atraso`;
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays <= 7) return `${diffDays} dias`;
    return date.toLocaleDateString('pt-PT');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {title}
          <Badge variant="outline" className="ml-auto">
            {goals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma meta definida</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal.current, goal.target);
              const isCompleted = goal.status === 'concluida' || progress >= 100;
              
              return (
                <div 
                  key={goal.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Cabeçalho da meta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(goal.status)}
                        <h4 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                          {goal.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {goal.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(goal.category)}`}
                      >
                        {goal.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(goal.priority)}`}
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Progresso */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className={`text-sm font-bold ${
                        isCompleted ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
                    />
                  </div>
                  
                  {/* Prazo */}
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Prazo: {formatDeadline(goal.deadline)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsWidget;