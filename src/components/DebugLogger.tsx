import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Info, RefreshCw, Eye, EyeOff } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DebugLoggerProps {
  title: string;
  onClear?: () => void;
}

class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(level: 'info' | 'success' | 'error' | 'debug', message: string, data?: any) {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };

    this.logs.unshift(entry); // Adicionar no início
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50); // Manter apenas os últimos 50
    }

    // Notificar listeners
    this.listeners.forEach(listener => listener([...this.logs]));

    // Também fazer console.log normal
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      debug: '🔍'
    }[level];

    console.log(`${emoji} ${message}`, data || '');
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    listener([...this.logs]); // Enviar logs atuais
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const debugLogger = DebugLogger.getInstance();

const DebugLoggerComponent: React.FC<DebugLoggerProps> = ({ title, onClear }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const handleClear = () => {
    debugLogger.clear();
    if (onClear) onClear();
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'debug': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'debug': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Mostrar Debug ({logs.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-800">
              🔍 {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {logs.length} logs
              </Badge>
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="max-h-64 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                Nenhum log ainda...
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border text-xs ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start space-x-2">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{log.message}</span>
                        <span className="text-xs opacity-60 ml-2">{log.timestamp}</span>
                      </div>
                      {log.data && (
                        <pre className="mt-1 text-xs bg-black bg-opacity-10 p-1 rounded overflow-x-auto">
                          {typeof log.data === 'object' 
                            ? JSON.stringify(log.data, null, 2) 
                            : String(log.data)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugLoggerComponent;
