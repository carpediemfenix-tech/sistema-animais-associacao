import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Command, 
  PawPrint, 
  Users, 
  Euro, 
  Calendar,
  Settings,
  FileText,
  AlertTriangle,
  Plus,
  BarChart3
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface SearchResult {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

const PesquisaGlobal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const searchResults: SearchResult[] = [
    // Animais
    { title: "Novo Animal", description: "Cadastrar novo animal", path: "/novo-animal", icon: <Plus className="h-4 w-4" />, category: "Animais" },
    { title: "Lista de Animais", description: "Ver todos os animais", path: "/animais", icon: <PawPrint className="h-4 w-4" />, category: "Animais" },
    { title: "Gestão de Animais", description: "Arquivar e gerir localizações", path: "/gestao-animais", icon: <Settings className="h-4 w-4" />, category: "Animais" },
    
    // Voluntários
    { title: "Voluntários", description: "Gerir voluntários e especialidades", path: "/voluntarios", icon: <Users className="h-4 w-4" />, category: "Voluntários" },
    
    // Financeiro
    { title: "Gestão Financeira", description: "Controlo de receitas e despesas", path: "/financeiro", icon: <Euro className="h-4 w-4" />, category: "Financeiro" },
    
    // Relatórios
    { title: "Relatórios Básicos", description: "Estatísticas básicas", path: "/relatorios", icon: <FileText className="h-4 w-4" />, category: "Relatórios" },
    { title: "Relatórios Avançados", description: "Análises detalhadas", path: "/relatorios-avancados", icon: <BarChart3 className="h-4 w-4" />, category: "Relatórios" },
    { title: "Dashboard Avançado", description: "Visão completa com gráficos", path: "/dashboard", icon: <BarChart3 className="h-4 w-4" />, category: "Dashboard" },
    
    // Alertas
    { title: "Alertas do Sistema", description: "Ver todos os alertas", path: "/alertas", icon: <AlertTriangle className="h-4 w-4" />, category: "Alertas" },
  ];

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearchTerm("");
  };

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full max-w-sm justify-start text-muted-foreground">
          <Search className="h-4 w-4 mr-2" />
          Pesquisar...
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Pesquisa Global
          </DialogTitle>
          <DialogDescription>
            Encontre rapidamente qualquer funcionalidade do sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite para pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {searchTerm && (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(groupedResults).map(([category, results]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-1">
                    {results.map((result) => (
                      <button
                        key={result.path}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{result.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum resultado encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tente pesquisar por "animal", "voluntário", "financeiro" ou "relatório"
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!searchTerm && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Ações Rápidas</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleResultClick("/novo-animal")}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Novo Animal</span>
                </button>
                <button
                  onClick={() => handleResultClick("/dashboard")}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </button>
                <button
                  onClick={() => handleResultClick("/alertas")}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Alertas</span>
                </button>
                <button
                  onClick={() => handleResultClick("/financeiro")}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <Euro className="h-4 w-4" />
                  <span className="text-sm">Financeiro</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PesquisaGlobal;