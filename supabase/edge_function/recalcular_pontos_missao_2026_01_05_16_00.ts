import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { missao_id } = await req.json()
    
    console.log('🔄 Recalculando pontos para missão:', missao_id)

    // 1. Buscar dados da missão
    const { data: missaoData, error: missaoError } = await supabaseClient
      .from('missoes_2025_12_18_14_15')
      .select('pontos_base, multiplicador_dificuldade, bonus_urgencia, prioridade')
      .eq('id', missao_id)
      .single()

    if (missaoError) {
      console.warn('⚠️ Erro ao buscar dados da missão:', missaoError)
    }

    // 2. Buscar participações da missão
    const { data: participacoes, error: participacoesError } = await supabaseClient
      .from('participacoes_missoes_2025_12_29_07_00')
      .select('*')
      .eq('missao_id', missao_id)

    if (participacoesError) {
      throw participacoesError
    }

    console.log(`📊 Encontradas ${participacoes?.length || 0} participações para recalcular`)

    let pontosRecalculados = 0
    let erros = 0

    // 3. Para cada participação, verificar se já tem pontos no histórico
    for (const participacao of participacoes || []) {
      try {
        // Verificar se já existe pontuação no histórico detalhado
        const { data: historicoExistente } = await supabaseClient
          .from('historico_pontos_detalhado_2026_01_05_15_00')
          .select('id')
          .eq('voluntario_id', participacao.voluntario_id)
          .eq('origem_id', missao_id)
          .eq('tipo_origem', 'missao')
          .single()

        if (historicoExistente) {
          console.log(`✅ Participação ${participacao.id} já tem pontuação calculada`)
          continue
        }

        // Calcular pontuação usando sistema inteligente
        const { data: pontuacaoResult, error: pontuacaoError } = await supabaseClient.functions.invoke(
          'calcular_pontuacao_inteligente_2026_01_05_15_00',
          {
            body: {
              data: {
                voluntario_id: participacao.voluntario_id,
                tipo_origem: 'missao',
                origem_id: missao_id,
                funcao: participacao.funcao,
                horas_dedicadas: parseFloat(participacao.horas_dedicadas || '0'),
                data_atividade: participacao.data_participacao,
                prioridade: missaoData?.prioridade || 'media',
                observacoes: `Recálculo automático - Participação como ${participacao.funcao} na missão`,
                pontos_base_origem: missaoData?.pontos_base || 0,
                multiplicador_dificuldade: missaoData?.multiplicador_dificuldade || 1.0,
                bonus_urgencia_origem: missaoData?.bonus_urgencia || 0
              }
            }
          }
        )

        if (pontuacaoError) {
          console.warn(`⚠️ Erro ao calcular pontuação para participação ${participacao.id}:`, pontuacaoError)
          erros++
          
          // Fallback para sistema básico
          const pontosBasicos = { 'coordenador': 25, 'participante': 10, 'apoio': 8, 'especialista': 15 }
          const pontosFallback = pontosBasicos[participacao.funcao as keyof typeof pontosBasicos] || 10
          
          // Inserir no histórico antigo como fallback
          await supabaseClient
            .from('historico_pontos_2025_12_22_02_00')
            .insert({
              voluntario_id: participacao.voluntario_id,
              pontos: pontosFallback,
              descricao: `Recálculo automático (fallback) - ${participacao.funcao}`,
              missao_id: missao_id,
              data_atribuicao: new Date().toISOString()
            })
          
          pontosRecalculados++
        } else {
          const pontosCalculados = pontuacaoResult?.data?.pontos_calculados || 0
          console.log(`✅ Pontuação recalculada para participação ${participacao.id}: ${pontosCalculados} pontos`)
          pontosRecalculados++
        }

      } catch (error) {
        console.error(`❌ Erro ao processar participação ${participacao.id}:`, error)
        erros++
      }
    }

    const resultado = {
      missao_id,
      total_participacoes: participacoes?.length || 0,
      pontos_recalculados: pontosRecalculados,
      erros: erros,
      sucesso: pontosRecalculados > 0
    }

    console.log('📊 Resultado do recálculo:', resultado)

    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro no recálculo de pontos:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Erro interno no recálculo de pontos'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})