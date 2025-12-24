import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧹 [CLEANUP] Iniciando limpeza de logs antigos...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calcular data limite (48 horas atrás)
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() - 48);
    
    console.log('📅 [CLEANUP] Data limite para limpeza:', dataLimite.toISOString());

    // Primeiro, contar quantos registos serão eliminados
    const { count: totalCount, error: countError } = await supabase
      .from('user_access_logs')
      .select('*', { count: 'exact', head: true })
      .lt('data_hora', dataLimite.toISOString());

    if (countError) {
      console.error('❌ [CLEANUP] Erro ao contar registos:', countError);
      throw countError;
    }

    console.log(`📊 [CLEANUP] Registos a eliminar: ${totalCount || 0}`);

    if (!totalCount || totalCount === 0) {
      console.log('✅ [CLEANUP] Nenhum registo antigo encontrado');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum registo antigo encontrado',
          deleted_count: 0,
          cutoff_date: dataLimite.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Eliminar registos antigos
    const { data, error } = await supabase
      .from('user_access_logs')
      .delete()
      .lt('data_hora', dataLimite.toISOString());

    if (error) {
      console.error('❌ [CLEANUP] Erro ao eliminar registos:', error);
      throw error;
    }

    console.log(`✅ [CLEANUP] ${totalCount} registos eliminados com sucesso`);

    // Verificar quantos registos restam
    const { count: remainingCount, error: remainingError } = await supabase
      .from('user_access_logs')
      .select('*', { count: 'exact', head: true });

    if (remainingError) {
      console.error('❌ [CLEANUP] Erro ao contar registos restantes:', remainingError);
    }

    console.log(`📊 [CLEANUP] Registos restantes: ${remainingCount || 0}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${totalCount} registos antigos eliminados com sucesso`,
        deleted_count: totalCount,
        remaining_count: remainingCount || 0,
        cutoff_date: dataLimite.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 [CLEANUP] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Erro ao limpar logs antigos'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})