import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const TestAprovisionamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Teste 1: Verificar autenticação
      results.push({
        test: "Autenticação",
        result: user ? "✅ Usuário logado" : "❌ Usuário não logado",
        details: user ? `ID: ${user.id}` : "Sem usuário"
      });

      // Teste 2: Verificar se consegue acessar categorias
      try {
        const { data: categorias, error: categoriasError } = await supabase
          .from('categorias_aprovisionamento_2026_01_06')
          .select('*');

        if (categoriasError) {
          results.push({
            test: "Acesso a Categorias",
            result: "❌ Erro",
            details: `${categoriasError.code}: ${categoriasError.message}`
          });
        } else {
          results.push({
            test: "Acesso a Categorias",
            result: `✅ Sucesso (${categorias?.length || 0} registros)`,
            details: categorias?.map(c => c.nome).join(', ') || 'Nenhuma categoria'
          });
        }
      } catch (error: any) {
        results.push({
          test: "Acesso a Categorias",
          result: "❌ Exceção",
          details: error.message
        });
      }

      // Teste 3: Verificar se consegue acessar tipos
      try {
        const { data: tipos, error: tiposError } = await supabase
          .from('tipos_aprovisionamento_2026_01_06')
          .select('*');

        if (tiposError) {
          results.push({
            test: "Acesso a Tipos",
            result: "❌ Erro",
            details: `${tiposError.code}: ${tiposError.message}`
          });
        } else {
          results.push({
            test: "Acesso a Tipos",
            result: `✅ Sucesso (${tipos?.length || 0} registros)`,
            details: `${tipos?.length || 0} tipos encontrados`
          });
        }
      } catch (error: any) {
        results.push({
          test: "Acesso a Tipos",
          result: "❌ Exceção",
          details: error.message
        });
      }

      // Teste 4: Testar inserção de categoria
      try {
        const testCategoria = {
          nome: `Teste ${Date.now()}`,
          descricao: 'Categoria de teste',
          tem_numero_serie: false,
          tem_validade: false,
          permite_devolucao: true,
          permite_atribuicao_animais: false,
          requer_verificacao: false,
          cor_interface: '#FF0000',
          icone: 'Package'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('categorias_aprovisionamento_2026_01_06')
          .insert([testCategoria])
          .select();

        if (insertError) {
          results.push({
            test: "Inserção de Categoria",
            result: "❌ Erro",
            details: `${insertError.code}: ${insertError.message}`
          });
        } else {
          results.push({
            test: "Inserção de Categoria",
            result: "✅ Sucesso",
            details: `Categoria criada: ${insertData?.[0]?.nome}`
          });

          // Limpar categoria de teste
          if (insertData?.[0]?.id) {
            await supabase
              .from('categorias_aprovisionamento_2026_01_06')
              .delete()
              .eq('id', insertData[0].id);
          }
        }
      } catch (error: any) {
        results.push({
          test: "Inserção de Categoria",
          result: "❌ Exceção",
          details: error.message
        });
      }

      // Teste 5: Verificar políticas RLS
      try {
        const { data: policies } = await supabase
          .rpc('get_policies_info', { table_name: 'categorias_aprovisionamento_2026_01_06' })
          .single();

        results.push({
          test: "Políticas RLS",
          result: policies ? "✅ Encontradas" : "⚠️ Não encontradas",
          details: policies ? "Políticas RLS ativas" : "Sem políticas ou erro na consulta"
        });
      } catch (error: any) {
        results.push({
          test: "Políticas RLS",
          result: "⚠️ Não testável",
          details: "Função RPC não disponível"
        });
      }

    } catch (error: any) {
      results.push({
        test: "Erro Geral",
        result: "❌ Falha",
        details: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔧 Teste de Diagnóstico - Módulo Aprovisionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Este teste verifica se o módulo de Aprovisionamento está funcionando corretamente.
              </p>
              
              <Button onClick={runTests} disabled={loading}>
                {loading ? "Executando Testes..." : "Executar Testes"}
              </Button>

              {testResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Resultados dos Testes:</h3>
                  
                  {testResults.map((result, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: result.result.includes('✅') ? '#10B981' : 
                                     result.result.includes('⚠️') ? '#F59E0B' : '#EF4444'
                    }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{result.test}</h4>
                            <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                          </div>
                          <span className="text-lg">{result.result}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Usuário:</strong> {user?.email || 'Não logado'}</p>
              <p><strong>ID do Usuário:</strong> {user?.id || 'N/A'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              <p><strong>URL Supabase:</strong> {supabase.supabaseUrl}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default TestAprovisionamento;