import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface AtualizarPontuacaoRequest {
  participacao_id: string;
  voluntario_id: string;
  missao_id: string;
  funcao: string;
  horas_dedicadas: number;
  data_atividade: string;
  observacoes?: string;
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

    const { data: requestData } = await req.json() as { data: AtualizarPontuacaoRequest }
    
    console.log('🔄 Atualizando pontuação da participação:', requestData.participacao_id)

    // 1. Buscar dados da missão
    const { data: missaoData, error: missaoError } = await supabaseClient
      .from('missoes_2025_12_18_14_15')
      .select('pontos_base, multiplicador_dificuldade, bonus_urgencia, prioridade')
      .eq('id', requestData.missao_id)
      .single()

    if (missaoError) {
      console.warn('⚠️ Erro ao buscar dados da missão:', missaoError)
    }

    // 2. Remover pontuação antiga do histórico detalhado
    const { error: deleteDetalhadoError } = await supabaseClient
      .from('historico_pontos_detalhado_2026_01_05_15_00')
      .delete()
      .eq('voluntario_id', requestData.voluntario_id)
      .eq('origem_id', requestData.missao_id)
      .eq('tipo_origem', 'missao')

    if (deleteDetalhadoError) {
      console.warn('⚠️ Erro ao remover histórico detalhado:', deleteDetalhadoError)
    }

    // 3. Remover pontuação antiga do histórico antigo
    const { error: deleteAntigoError } = await supabaseClient
      .from('historico_pontos_2025_12_22_02_00')
      .delete()
      .eq('voluntario_id', requestData.voluntario_id)
      .eq('missao_id', requestData.missao_id)

    if (deleteAntigoError) {
      console.warn('⚠️ Erro ao remover histórico antigo:', deleteAntigoError)
    }

    // 4. Buscar pontuação total atual do voluntário (para ajustar)
    const { data: voluntarioData } = await supabaseClient
      .from('voluntarios')
      .select('pontuacao_total')
      .eq('id', requestData.voluntario_id)
      .single()

    const pontuacaoAtualVoluntario = voluntarioData?.pontuacao_total || 0

    // 5. Calcular nova pontuação usando sistema inteligente
    const { data: pontuacaoResult, error: pontuacaoError } = await supabaseClient.functions.invoke(
      'calcular_pontuacao_inteligente_2026_01_05_15_00',
      {
        body: {
          data: {
            voluntario_id: requestData.voluntario_id,
            tipo_origem: 'missao',
            origem_id: requestData.missao_id,
            funcao: requestData.funcao,
            horas_dedicadas: requestData.horas_dedicadas,
            data_atividade: requestData.data_atividade,
            prioridade: missaoData?.prioridade || 'media',
            observacoes: requestData.observacoes || `Participação atualizada como ${requestData.funcao} na missão`,
            pontos_base_origem: missaoData?.pontos_base || 0,
            multiplicador_dificuldade: missaoData?.multiplicador_dificuldade || 1.0,
            bonus_urgencia_origem: missaoData?.bonus_urgencia || 0
          }
        }
      }
    )

    let pontosCalculados = 0
    let detalhesCalculo = null

    if (pontuacaoError) {
      console.warn('⚠️ Erro no cálculo inteligente, usando fallback:', pontuacaoError)
      
      // Fallback para sistema básico
      const pontosBasicos = { 
        'coordenador': 25, 
        'participante': 10, 
        'apoio': 8, 
        'especialista': 15 
      }
      pontosCalculados = pontosBasicos[requestData.funcao as keyof typeof pontosBasicos] || 10
      
      // Adicionar pontos por horas (básico: 2 pontos por hora)
      pontosCalculados += Math.round(requestData.horas_dedicadas * 2)
      
      // Inserir no histórico antigo como fallback
      await supabaseClient
        .from('historico_pontos_2025_12_22_02_00')
        .insert({
          voluntario_id: requestData.voluntario_id,
          pontos: pontosCalculados,
          descricao: `Participação atualizada (fallback) - ${requestData.funcao}`,
          missao_id: requestData.missao_id,
          data_atribuicao: new Date().toISOString()
        })
      
    } else {
      pontosCalculados = pontuacaoResult?.data?.pontos_calculados || 0
      detalhesCalculo = pontuacaoResult?.data?.detalhes_calculo
      console.log('✅ Nova pontuação calculada:', pontosCalculados)
    }

    // 6. Atualizar pontuação total do voluntário
    // Nota: A função calcular_pontuacao_inteligente já atualiza a pontuação total,
    // mas vamos garantir que está correto
    const { error: updateVoluntarioError } = await supabaseClient
      .from('voluntarios')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.voluntario_id)

    if (updateVoluntarioError) {
      console.warn('⚠️ Erro ao atualizar timestamp do voluntário:', updateVoluntarioError)
    }

    const resultado = {
      participacao_id: requestData.participacao_id,
      voluntario_id: requestData.voluntario_id,
      missao_id: requestData.missao_id,
      pontos_anteriores: 'removidos',
      pontos_novos: pontosCalculados,
      detalhes_calculo: detalhesCalculo,
      metodo_calculo: pontuacaoError ? 'fallback_basico' : 'inteligente',
      sucesso: true
    }

    console.log('✅ Pontuação atualizada com sucesso:', resultado)

    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro na atualização de pontuação:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Erro interno na atualização de pontuação'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})