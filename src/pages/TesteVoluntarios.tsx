import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Search, 
  TestTube,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import VoluntarioSelector from '@/components/VoluntarioSelector';
import VoluntarioProfile from '@/components/VoluntarioProfile';
import EnhancedFooter from '@/components/EnhancedFooter';
import { useToast } from "@/hooks/use-toast";

interface Voluntario {
  id: string;
  full_name: string;
  nickname?: string;
  short_name: string;
  display_name: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

const TesteVoluntarios: React.FC = () => {
  const { toast } = useToast();
  const [selectedVoluntarioId, setSelectedVoluntarioId] = useState<string>("");
  const [selectedVoluntario, setSelectedVoluntario] = useState<Voluntario | undefined>();

  const handleVoluntarioSelect = (voluntarioId: string, voluntario?: Voluntario) => {
    setSelectedVoluntarioId(voluntarioId);
    setSelectedVoluntario(voluntario);
    
    if (voluntario) {
      toast({
        title: "Voluntário Selecionado",
        description: `${voluntario.display_name} foi selecionado`,
      });
    }
  };

  const testCases = [
    {
      full_name: "João da Silva",
      nickname: null,
      expected_display: "João Silva",
      description: "Nome com partícula 'da' - deve ignorar"
    },
    {
      full_name: "Maria do Carmo Pereira",
      nickname: null,
      expected_display: "Maria Pereira",
      description: "Nome com partículas 'do' - deve usar primeiro e último válido"
    },
    {
      full_name: "Ana",
      nickname: null,
      expected_display: "Ana",
      description: "Nome único - deve manter como está"
    },
    {
      full_name: "Pedro dos Santos",
      nickname: "Rato",
      expected_display: "Rato",
      description: "Com apelido - deve usar o apelido como display_name"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Nomes de Voluntários</h1>
            <p className="text-gray-600">
              Teste e demonstração do novo sistema de nomes com display_name
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <TestTube className="h-4 w-4 mr-2" />
            Página de Teste
          </Badge>
        </div>

        <Tabs defaultValue="selector" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="selector">Seletor de Voluntários</TabsTrigger>
            <TabsTrigger value="profile">Perfil do Voluntário</TabsTrigger>
            <TabsTrigger value="tests">Testes de Aceitação</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>

          <TabsContent value="selector" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Teste do Seletor de Voluntários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <VoluntarioSelector
                      value={selectedVoluntarioId}
                      onValueChange={handleVoluntarioSelect}
                      label="Selecionar Voluntário"
                      placeholder="Escolha um voluntário..."
                      showFullName={true}
                      required
                    />
                  </div>
                  
                  <div>
                    {selectedVoluntario && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Voluntário Selecionado:</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>ID:</strong> {selectedVoluntario.id}</div>
                          <div><strong>Display Name:</strong> {selectedVoluntario.display_name}</div>
                          <div><strong>Nome Completo:</strong> {selectedVoluntario.full_name}</div>
                          {selectedVoluntario.nickname && (
                            <div><strong>Apelido:</strong> {selectedVoluntario.nickname}</div>
                          )}
                          <div><strong>Email:</strong> {selectedVoluntario.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Perfil do Voluntário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVoluntarioId ? (
                  <VoluntarioProfile
                    voluntarioId={selectedVoluntarioId}
                    showEditButton={true}
                    isCurrentUser={false}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione um voluntário na aba "Seletor de Voluntários" para ver o perfil</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2 text-purple-600" />
                  Testes de Aceitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Casos de teste para validar as regras de cálculo do display_name:
                  </p>
                  
                  {testCases.map((testCase, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Teste {index + 1}</Badge>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><strong>Nome Completo:</strong> "{testCase.full_name}"</div>
                            <div><strong>Apelido:</strong> {testCase.nickname ? `"${testCase.nickname}"` : "null"}</div>
                            <div><strong>Display Name Esperado:</strong> "{testCase.expected_display}"</div>
                            <div className="text-gray-600"><strong>Descrição:</strong> {testCase.description}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Documentação do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Campos Implementados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">full_name</h4>
                      <p className="text-sm text-blue-700">Nome completo legal (obrigatório)</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">nickname</h4>
                      <p className="text-sm text-green-700">Nome operacional escolhido (opcional)</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">short_name</h4>
                      <p className="text-sm text-purple-700">Primeiro + último apelido (calculado)</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900">display_name</h4>
                      <p className="text-sm text-orange-700">Nome que aparece na app (calculado)</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">Regras de Cálculo</h3>
                  <div className="space-y-2 mb-6">
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <strong>display_name:</strong> Se nickname estiver preenchido, usa nickname. Caso contrário, usa short_name.
                    </div>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <strong>short_name:</strong> Primeiro nome + último apelido (ignorando partículas: da, de, do, dos, das, e).
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">Funcionalidades Implementadas</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Triggers automáticos para recalcular campos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Migração automática dos dados existentes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Componente de seleção com busca</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Componente de perfil com edição</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Permissões RLS configuradas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Índices para performance</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default TesteVoluntarios;