import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface CalculoPontuacaoRequest {
  voluntario_id: string;
  tipo_origem: 'missao' | 'formacao' | 'especialidade' | 'horas_dedicadas';
  origem_id?: string;
  funcao: string;
  horas_dedicadas?: number;
  data_atividade: string;
  especialidade_codigo?: string;
  nivel_experiencia?: string;
  prioridade?: string;
  complexidade?: string;
  urgencia?: string;
  duracao?: string;
  observacoes?: string;
  // Dados específicos da missão/formação
  pontos_base_origem?: number;
  multiplicador_dificuldade?: number;
  bonus_urgencia_origem?: number;
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

    const { data: requestData } = await req.json() as { data: CalculoPontuacaoRequest }
    
    console.log('🧮 Iniciando cálculo de pontuação:', requestData)

    // 1. Buscar configuração da função
    const { data: configFuncao, error: errorFuncao } = await supabaseClient
      .from('config_pontuacao_funcoes_2026_01_05_15_00')
      .select('*')
      .eq('funcao', requestData.funcao)
      .eq('ativo', true)
      .single()

    if (errorFuncao) {
      console.warn('⚠️ Configuração de função não encontrada, usando padrão:', requestData.funcao)
    }

    // 2. Buscar configuração da especialidade (se aplicável)
    let configEspecialidade = null
    if (requestData.especialidade_codigo && requestData.nivel_experiencia) {
      const { data: especialidadeData } = await supabaseClient
        .from('config_pontuacao_especialidades_2026_01_05_15_00')
        .select('*')
        .eq('especialidade_codigo', requestData.especialidade_codigo)
        .eq('nivel_experiencia', requestData.nivel_experiencia)
        .eq('ativo', true)
        .single()
      
      configEspecialidade = especialidadeData
    }

    // 3. Buscar configuração de horas (se aplicável)
    let configHoras = null
    if (requestData.horas_dedicadas && requestData.horas_dedicadas > 0) {
      const { data: horasData } = await supabaseClient
        .from('config_pontuacao_horas_2026_01_05_15_00')
        .select('*')
        .eq('tipo_atividade', requestData.tipo_origem)
        .eq('ativo', true)
        .single()
      
      configHoras = horasData
    }

    // 4. Buscar multiplicadores
    const multiplicadores = {
      prioridade: 1.0,
      complexidade: 1.0,
      urgencia: 1.0,
      duracao: 1.0
    }

    const bonusMultiplicadores = {
      prioridade: 0,
      complexidade: 0,
      urgencia: 0,
      duracao: 0
    }

    // Buscar multiplicadores configurados
    for (const [tipo, valor] of Object.entries({
      prioridade: requestData.prioridade,
      complexidade: requestData.complexidade,
      urgencia: requestData.urgencia,
      duracao: requestData.duracao
    })) {
      if (valor) {
        const { data: multData } = await supabaseClient
          .from('config_multiplicadores_2026_01_05_15_00')
          .select('*')
          .eq('tipo', tipo)
          .eq('valor', valor)
          .eq('ativo', true)
          .single()
        
        if (multData) {
          multiplicadores[tipo as keyof typeof multiplicadores] = multData.multiplicador
          bonusMultiplicadores[tipo as keyof typeof bonusMultiplicadores] = multData.bonus_adicional
        }
      }
    }

    // 5. CÁLCULO DA PONTUAÇÃO

    // Pontos base (função + origem + especialidade)
    let pontosBase = configFuncao?.pontos_base || 10
    
    // Adicionar pontos da origem (missão/formação)
    if (requestData.pontos_base_origem) {
      pontosBase += requestData.pontos_base_origem
    }

    // Adicionar pontos da especialidade
    if (configEspecialidade) {
      pontosBase += configEspecialidade.pontos_base
    }

    // Pontos por horas dedicadas
    let pontosHoras = 0
    let pontosHoraBruto = 0
    if (requestData.horas_dedicadas && configHoras) {
      const horasValidas = Math.min(
        Math.max(requestData.horas_dedicadas, configHoras.minimo_horas),
        configHoras.maximo_horas_dia
      )
      
      pontosHoraBruto = configHoras.pontos_por_hora
      pontosHoras = horasValidas * pontosHoraBruto

      // Aplicar multiplicadores temporais
      const dataAtividade = new Date(requestData.data_atividade)
      const diaSemana = dataAtividade.getDay()
      const hora = dataAtividade.getHours()

      // Fim de semana (sábado=6, domingo=0)
      if (diaSemana === 0 || diaSemana === 6) {
        pontosHoras *= configHoras.multiplicador_fim_semana
      }

      // Horário noturno (22h-6h)
      if (hora >= 22 || hora <= 6) {
        pontosHoras *= configHoras.multiplicador_noturno
      }
    }

    // Multiplicadores da função
    let multiplicadorFuncao = 1.0
    if (configFuncao) {
      // Se é coordenador, aplicar multiplicador de coordenação
      if (requestData.funcao.toLowerCase().includes('coordenador')) {
        multiplicadorFuncao = configFuncao.multiplicador_coordenacao
      }
      // Se tem especialidade, aplicar multiplicador de especialista
      else if (configEspecialidade) {
        multiplicadorFuncao = configFuncao.multiplicador_especialista
      }
    }

    // Multiplicador da especialidade
    let multiplicadorEspecialidade = 1.0
    if (configEspecialidade) {
      multiplicadorEspecialidade = configEspecialidade.multiplicador_certificado
    }

    // Multiplicador temporal (combinado)
    let multiplicadorTemporal = 1.0
    const dataAtividade = new Date(requestData.data_atividade)
    const diaSemana = dataAtividade.getDay()
    
    // Fim de semana
    if (diaSemana === 0 || diaSemana === 6) {
      multiplicadorTemporal *= 1.2
    }

    // Multiplicador da origem (missão/formação)
    const multiplicadorOrigem = requestData.multiplicador_dificuldade || 1.0

    // Bônus
    let bonusLideranca = configFuncao?.bonus_lideranca || 0
    let bonusCertificacao = 0
    let bonusExperiencia = configEspecialidade?.bonus_experiencia || 0
    let bonusEspecial = requestData.bonus_urgencia_origem || 0

    // Somar todos os bônus de multiplicadores
    const bonusTotal = Object.values(bonusMultiplicadores).reduce((sum, bonus) => sum + bonus, 0)
    bonusEspecial += bonusTotal

    // CÁLCULO FINAL
    const pontosBaseFinal = pontosBase * multiplicadorFuncao * multiplicadorEspecialidade * multiplicadorOrigem
    const pontosHorasFinal = pontosHoras * multiplicadorTemporal
    const multiplicadorFinal = multiplicadores.prioridade * multiplicadores.complexidade * multiplicadores.urgencia * multiplicadores.duracao
    
    const pontosTotalSemBonus = (pontosBaseFinal + pontosHorasFinal) * multiplicadorFinal
    const pontosTotalComBonus = pontosTotalSemBonus + bonusLideranca + bonusCertificacao + bonusExperiencia + bonusEspecial

    const pontosTotal = Math.round(pontosTotalComBonus)

    // 6. Salvar no histórico detalhado
    const historicoData = {
      voluntario_id: requestData.voluntario_id,
      tipo_origem: requestData.tipo_origem,
      origem_id: requestData.origem_id,
      pontos_base: pontosBase,
      horas_dedicadas: requestData.horas_dedicadas || 0,
      pontos_por_hora: pontosHoraBruto,
      multiplicador_funcao: multiplicadorFuncao,
      multiplicador_especialidade: multiplicadorEspecialidade,
      multiplicador_prioridade: multiplicadores.prioridade,
      multiplicador_complexidade: multiplicadores.complexidade,
      multiplicador_temporal: multiplicadorTemporal,
      bonus_lideranca: bonusLideranca,
      bonus_certificacao: bonusCertificacao,
      bonus_experiencia: bonusExperiencia,
      bonus_especial: bonusEspecial,
      pontos_total: pontosTotal,
      funcao: requestData.funcao,
      especialidade_codigo: requestData.especialidade_codigo,
      nivel_experiencia: requestData.nivel_experiencia,
      data_atividade: requestData.data_atividade,
      observacoes: requestData.observacoes,
      calculado_por: 'sistema_inteligente'
    }

    const { data: historicoResult, error: historicoError } = await supabaseClient
      .from('historico_pontos_detalhado_2026_01_05_15_00')
      .insert(historicoData)
      .select()
      .single()

    if (historicoError) {
      console.error('❌ Erro ao salvar histórico:', historicoError)
      throw historicoError
    }

    // 7. Atualizar pontuação total do voluntário
    const { error: updateError } = await supabaseClient
      .from('voluntarios')
      .update({ 
        pontuacao_total: supabaseClient.rpc('COALESCE', ['pontuacao_total', 0]) + pontosTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.voluntario_id)

    if (updateError) {
      console.warn('⚠️ Erro ao atualizar pontuação total:', updateError)
    }

    const resultado = {
      pontos_calculados: pontosTotal,
      detalhes_calculo: {
        pontos_base: pontosBase,
        pontos_horas: Math.round(pontosHorasFinal),
        multiplicadores: {
          funcao: multiplicadorFuncao,
          especialidade: multiplicadorEspecialidade,
          prioridade: multiplicadores.prioridade,
          complexidade: multiplicadores.complexidade,
          urgencia: multiplicadores.urgencia,
          duracao: multiplicadores.duracao,
          temporal: multiplicadorTemporal,
          origem: multiplicadorOrigem
        },
        bonus: {
          lideranca: bonusLideranca,
          certificacao: bonusCertificacao,
          experiencia: bonusExperiencia,
          especial: bonusEspecial
        },
        historico_id: historicoResult.id
      }
    }

    console.log('✅ Pontuação calculada:', resultado)

    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro no cálculo de pontuação:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Erro interno no cálculo de pontuação'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})