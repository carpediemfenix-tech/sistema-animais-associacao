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

      // Teste 1: Verificar acesso direto à tabela
      console.log('📋 Teste 1: Verificando acesso à tabela...');
      let tabelaExiste = false;
      let errorTabelas = null;
      
      try {
        const { data: testeTabela, error } = await supabase
          .from('categorias_financeiras')
          .select('id')
          .limit(1);
        
        if (!error) {
          tabelaExiste = true;
          console.log('✅ Tabela categorias_financeiras existe e é acessível');
        } else {
          errorTabelas = error;
          console.log('❌ Erro ao acessar tabela:', error);
        }
      } catch (err) {
        errorTabelas = err;
        console.log('💥 Erro na consulta da tabela:', err);
      }

      // Teste 2: Tentar consulta completa
      console.log('📊 Teste 2: Consultando categorias...');
      const { data: categorias, error: errorCategorias } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .limit(5);

      console.log('📊 Resultado da consulta:', { categorias, errorCategorias });

      // Teste 3: Contar registos
      console.log('🔢 Teste 3: Contando registos...');
      const { count, error: errorCount } = await supabase
        .from('categorias_financeiras')
        .select('*', { count: 'exact', head: true });

      console.log('🔢 Contagem:', { count, errorCount });

      // Teste 4: Verificar categorias ativas
      console.log('🔐 Teste 4: Verificando categorias ativas...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, ativo, tipo, escopo')
        .eq('ativo', true)
        .limit(3);

      console.log('🔐 Teste RLS:', { rlsTest, rlsError });

      // Teste 5: Verificar estrutura específica
      console.log('🏗️ Teste 5: Verificando estrutura...');
      const { data: estrutura, error: errorEstrutura } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, tipo, escopo, cor, icone, ativo, ordem')
        .order('ordem')
        .limit(2);

      console.log('🏗️ Estrutura:', { estrutura, errorEstrutura });

      setResultado({
        tabela: { existe: tabelaExiste, error: errorTabelas },
        categorias: { data: categorias, error: errorCategorias },
        count: { count, error: errorCount },
        ativas: { data: rlsTest, error: rlsError },
        estrutura: { data: estrutura, error: errorEstrutura }
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
                
                {/* Teste 1: Acesso à Tabela */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.tabela?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 1: Acesso à Tabela
                  </h3>
                  {resultado.tabela?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.tabela.error.message}</p>
                      <p><strong>Código:</strong> {resultado.tabela.error.code}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Status:</strong> {resultado.tabela?.existe ? 'Tabela acessível ✅' : 'Tabela não encontrada ❌'}</p>
                    </div>
                  )}
                </div>

                {/* Teste 2: Consulta Completa */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.categorias?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 2: Consulta de Categorias
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
                      {resultado.categorias?.data?.length > 0 && (
                        <div className="mt-2">
                          <p><strong>Primeiras categorias:</strong></p>
                          <ul className="list-disc list-inside text-sm">
                            {resultado.categorias.data.slice(0, 3).map((cat: any, idx: number) => (
                              <li key={idx}>{cat.nome} ({cat.tipo} - {cat.escopo})</li>
                            ))}
                          </ul>
                        </div>
                      )}
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

                {/* Teste 4: Categorias Ativas */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.ativas?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 4: Categorias Ativas
                  </h3>
                  {resultado.ativas?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.ativas.error.message}</p>
                      <p><strong>Código:</strong> {resultado.ativas.error.code}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Categorias ativas:</strong> {resultado.ativas?.data?.length || 0}</p>
                      {resultado.ativas?.data?.length > 0 && (
                        <div className="mt-2">
                          <p><strong>Exemplos:</strong></p>
                          <ul className="list-disc list-inside text-sm">
                            {resultado.ativas.data.map((cat: any, idx: number) => (
                              <li key={idx}>{cat.nome} ({cat.tipo} - {cat.escopo})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Teste 5: Estrutura */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    {resultado.estrutura?.error ? 
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> : 
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    }
                    Teste 5: Estrutura da Tabela
                  </h3>
                  {resultado.estrutura?.error ? (
                    <div className="text-red-600">
                      <p><strong>Erro:</strong> {resultado.estrutura.error.message}</p>
                    </div>
                  ) : (
                    <div className="text-green-600">
                      <p><strong>Estrutura verificada:</strong> ✅</p>
                      {resultado.estrutura?.data?.length > 0 && (
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 max-h-40 overflow-y-auto">
                          {JSON.stringify(resultado.estrutura.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Resumo Final */}
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-blue-800 mb-2">📊 RESUMO DO DIAGNÓSTICO</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Tabela Acessível:</strong> {resultado.tabela?.existe ? '✅ Sim' : '❌ Não'}</p>
                      <p><strong>Categorias Carregadas:</strong> {resultado.categorias?.data?.length || 0}</p>
                      <p><strong>Total de Registos:</strong> {resultado.count?.count || 0}</p>
                    </div>
                    <div>
                      <p><strong>Categorias Ativas:</strong> {resultado.ativas?.data?.length || 0}</p>
                      <p><strong>Estrutura OK:</strong> {resultado.estrutura?.error ? '❌ Não' : '✅ Sim'}</p>
                      <p><strong>Status Geral:</strong> {
                        resultado.tabela?.existe && 
                        !resultado.categorias?.error && 
                        (resultado.count?.count || 0) > 0 ? 
                        '✅ FUNCIONANDO' : '❌ PROBLEMAS'
                      }</p>
                    </div>
                  </div>
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