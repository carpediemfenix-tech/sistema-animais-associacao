import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Heart, 
  PawPrint, 
  Users, 
  Stethoscope, 
  DollarSign,
  Calendar,
  CheckCircle
} from "lucide-react";

interface Activity {
  id: string;
  type: 'adocao' | 'animal' | 'voluntario' | 'intervencao' | 'financeiro' | 'sistema';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

interface RecentActivitiesProps {
  activities: Activity[];
  maxItems?: number;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities, 
  maxItems = 8 
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'adocao': return <Heart className={`${iconClass} text-green-600`} />;
      case 'animal': return <PawPrint className={`${iconClass} text-blue-600`} />;
      case 'voluntario': return <Users className={`${iconClass} text-purple-600`} />;
      case 'intervencao': return <Stethoscope className={`${iconClass} text-red-600`} />;
      case 'financeiro': return <DollarSign className={`${iconClass} text-emerald-600`} />;
      case 'sistema': return <CheckCircle className={`${iconClass} text-gray-600`} />;
      default: return <Calendar className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusColor = (status?: Activity['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-PT');
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Atividades Recentes
          <Badge variant="outline" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                  index !== displayActivities.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Ícone da atividade */}
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Conteúdo da atividade */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-gray-500 mt-1">
                          por {activity.user}
                        </p>
                      )}
                    </div>
                    
                    {/* Status e timestamp */}
                    <div className="flex flex-col items-end gap-1">
                      {activity.status && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > maxItems && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Mostrando {maxItems} de {activities.length} atividades
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;