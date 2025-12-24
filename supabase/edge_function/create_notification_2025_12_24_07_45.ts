import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface NotificacaoRequest {
  utilizador_id?: string;
  titulo: string;
  mensagem: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica' | 'urgente';
  categoria?: string;
  entidade_tipo?: string;
  entidade_id?: string;
  acao_url?: string;
  acao_texto?: string;
  metadata?: any;
  tipo_codigo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 [NOTIFICATION] Processando solicitação de notificação...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body: NotificacaoRequest = await req.json();
    
    console.log('📝 [NOTIFICATION] Dados recebidos:', {
      titulo: body.titulo,
      utilizador_id: body.utilizador_id,
      prioridade: body.prioridade,
      categoria: body.categoria
    });

    // Validar dados obrigatórios
    if (!body.titulo || !body.mensagem) {
      throw new Error('Título e mensagem são obrigatórios');
    }

    // Buscar tipo de notificação se fornecido
    let tipo_id = null;
    if (body.tipo_codigo) {
      const { data: tipoData, error: tipoError } = await supabase
        .from('tipos_notificacoes')
        .select('id')
        .eq('codigo', body.tipo_codigo)
        .eq('ativo', true)
        .single();

      if (tipoError) {
        console.warn('⚠️ [NOTIFICATION] Tipo não encontrado:', body.tipo_codigo);
      } else {
        tipo_id = tipoData.id;
      }
    }

    // Preparar dados da notificação
    const notificacaoData = {
      tipo_id,
      utilizador_id: body.utilizador_id || 'admin',
      titulo: body.titulo,
      mensagem: body.mensagem,
      prioridade: body.prioridade || 'media',
      categoria: body.categoria || 'sistema',
      entidade_tipo: body.entidade_tipo,
      entidade_id: body.entidade_id,
      acao_url: body.acao_url,
      acao_texto: body.acao_texto,
      lida: false,
      arquivada: false,
      auto_dismiss: false,
      som_ativo: true,
      metadata: body.metadata
    };

    console.log('💾 [NOTIFICATION] Criando notificação:', notificacaoData);

    // Criar notificação
    const { data, error } = await supabase
      .from('notificacoes')
      .insert([notificacaoData])
      .select()
      .single();

    if (error) {
      console.error('❌ [NOTIFICATION] Erro ao criar notificação:', error);
      throw error;
    }

    console.log('✅ [NOTIFICATION] Notificação criada com sucesso:', data.id);

    // Se for notificação crítica ou urgente, criar notificações para todos os admins
    if (body.prioridade === 'critica' || body.prioridade === 'urgente') {
      console.log('🚨 [NOTIFICATION] Notificação crítica - enviando para todos os admins');
      
      // Buscar todos os utilizadores admin
      const { data: admins, error: adminError } = await supabase
        .from('utilizadores')
        .select('username')
        .eq('perfil_acesso', 'administrador')
        .eq('ativo', true);

      if (!adminError && admins && admins.length > 0) {
        const notificacoesAdmin = admins
          .filter(admin => admin.username !== body.utilizador_id) // Não duplicar para o próprio utilizador
          .map(admin => ({
            ...notificacaoData,
            utilizador_id: admin.username,
            titulo: `🚨 ALERTA: ${body.titulo}`,
            mensagem: `Notificação crítica do sistema: ${body.mensagem}`
          }));

        if (notificacoesAdmin.length > 0) {
          const { error: batchError } = await supabase
            .from('notificacoes')
            .insert(notificacoesAdmin);

          if (batchError) {
            console.error('❌ [NOTIFICATION] Erro ao criar notificações para admins:', batchError);
          } else {
            console.log(`✅ [NOTIFICATION] ${notificacoesAdmin.length} notificações enviadas para admins`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação criada com sucesso',
        notification_id: data.id,
        created_at: data.created_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 [NOTIFICATION] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Erro ao criar notificação'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})