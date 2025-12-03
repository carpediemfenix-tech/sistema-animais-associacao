import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  title: string;
  data: PieData[];
  icon?: React.ReactNode;
}

const PieChart: React.FC<PieChartProps> = ({ title, data, icon }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calcular ângulos para cada segmento
  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  // Criar path SVG para cada segmento
  const createPath = (startAngle: number, endAngle: number) => {
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Gráfico SVG */}
          <div className="flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={createPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </svg>
          </div>
          
          {/* Legenda */}
          <div className="flex-1 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700">{segment.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{segment.value}</div>
                  <div className="text-xs text-gray-500">
                    {segment.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;