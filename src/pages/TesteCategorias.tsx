import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const TesteCategorias = () => {
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testarCategorias = async () => {
    setLoading(true);
    setResultado(null);

    try {
      console.log('🧪 Iniciando teste de categorias...');

      // Teste 1: Verificar se a tabela existe
      const { data: tabelas, error: errorTabelas } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .like('table_name', '%categorias_financeiras%');

      console.log('📋 Tabelas encontradas:', tabelas);

      // Teste 2: Tentar consulta direta
      const { data: categorias, error: errorCategorias } = await supabase
        .from('categorias_financeiras_2025_11_28_05_52')
        .select('*')
        .limit(5);

      console.log('📊 Resultado da consulta:', { categorias, errorCategorias });

      // Teste 3: Contar registos
      const { count, error: errorCount } = await supabase
        .from('categorias_financeiras_2025_11_28_05_52')
        .select('*', { count: 'exact', head: true });

      console.log('🔢 Contagem:', { count, errorCount });

      // Teste 4: Verificar RLS
      const { data: rlsTest, error: rlsError } = await supabase
        .from('categorias_financeiras_2025_11_28_05_52')
        .select('id, nome, ativo')
        .eq('ativo', true)
        .limit(3);

      console.log('🔐 Teste RLS:', { rlsTest, rlsError });

      setResultado({
        tabelas: { data: tabelas, error: errorTabelas },
        categorias: { data: categorias, error: errorCategorias },
        count: { count, error: errorCount },
        rls: { data: rlsTest, error: rlsError }
      });

    } catch (error) {
      console.error('💥 Erro no teste:', error);
      setResultado({ erro: error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testarCategorias();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Teste de Categorias Financeiras" 
        subtitle="Diagnóstico da base de dados"
        backTo="/administracao"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Diagnóstico de Categorias</CardTitle>
              <Button onClick={testarCategorias} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Testar Novamente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p>A executar testes...</p>
              </div>
            ) : resultado ? (
              <div className="space-y-6">
                
                {/* Teste 1: Tabelas */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.tabelas?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 1: Verificar Tabelas
                  </h3>
                  {resultado.tabelas?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.tabelas.error.message}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Tabelas encontradas:</strong> {resultado.tabelas?.data?.length || 0}</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                        {JSON.stringify(resultado.tabelas?.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Teste 2: Consulta Direta */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.categorias?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 2: Consulta Direta
                  </h3>
                  {resultado.categorias?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.categorias.error.message}</p>
                      <p><strong>Código:</strong> {resultado.categorias.error.code}</p>
                      <p><strong>Detalhes:</strong> {resultado.categorias.error.details}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Categorias encontradas:</strong> {resultado.categorias?.data?.length || 0}</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 max-h-40 overflow-y-auto">
                        {JSON.stringify(resultado.categorias?.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Teste 3: Contagem */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.count?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 3: Contagem de Registos
                  </h3>
                  {resultado.count?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.count.error.message}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Total de registos:</strong> {resultado.count?.count || 0}</p>
                    </div>
                  )}
                </div>

                {/* Teste 4: RLS */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.rls?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 4: Row Level Security
                  </h3>
                  {resultado.rls?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro RLS:</strong> {resultado.rls.error.message}</p>
                      <p><strong>Código:</strong> {resultado.rls.error.code}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Registos acessíveis:</strong> {resultado.rls?.data?.length || 0}</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                        {JSON.stringify(resultado.rls?.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Erro Geral */}
                {resultado.erro && (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold mb-2 text-red-800">Erro Geral</h3>
                    <pre className="text-xs text-red-600">
                      {JSON.stringify(resultado.erro, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Clique em "Testar Novamente" para executar os testes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TesteCategorias;