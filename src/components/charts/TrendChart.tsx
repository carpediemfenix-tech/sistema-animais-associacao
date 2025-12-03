import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendData {
  label: string;
  value: number;
  change?: number;
}

interface TrendChartProps {
  title: string;
  data: TrendData[];
  color?: string;
  icon?: React.ReactNode;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  title, 
  data, 
  color = "#3b82f6",
  icon 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {item.value}
                    </span>
                    {item.change !== undefined && (
                      <div className={`flex items-center text-xs ${
                        item.change > 0 ? 'text-green-600' : 
                        item.change < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {item.change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : item.change < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : (
                          <Minus className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(item.change)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;