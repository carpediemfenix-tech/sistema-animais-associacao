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
    console.log('🔐 [AUTH] Iniciando autenticação...');
    
    // Parse request body
    const { username, password } = await req.json()
    console.log('🔍 [AUTH] Tentativa de login para:', username);

    if (!username || !password) {
      console.log('❌ [AUTH] Credenciais em falta');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Username e password são obrigatórios'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar credenciais na base de dados
    console.log('🔍 [AUTH] Verificando na base de dados...');
    
    const { data: userData, error: dbError } = await supabase
      .from('utilizadores_2025_11_23_03_00')
      .select('*')
      .eq('username', username)
      .eq('ativo', true)
      .single()

    if (dbError || !userData) {
      console.log('❌ [AUTH] Utilizador não encontrado:', username);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciais inválidas'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Verificar password (assumindo que está em texto simples para teste)
    if (userData.password !== password) {
      console.log('❌ [AUTH] Password incorreta para:', username);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciais inválidas'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Login bem-sucedido
    console.log('✅ [AUTH] Login bem-sucedido para:', username);
    
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          username: userData.username,
          nome: userData.nome,
          email: userData.email,
          tipo_utilizador: userData.tipo_utilizador,
          ativo: userData.ativo
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ [AUTH] Erro interno:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})