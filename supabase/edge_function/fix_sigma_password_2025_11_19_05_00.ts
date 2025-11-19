import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔐 [SIGMA_FIX] Corrigindo password do Sigma...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente em falta')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Gerar hash para "V@ngelis1973"
    const password = "V@ngelis1973"
    console.log('🔐 [SIGMA_FIX] Gerando hash para password:', password)
    
    const hash = await bcrypt.hash(password, 10)
    console.log('✅ [SIGMA_FIX] Hash gerado:', hash)
    
    // Testar o hash
    const isValid = await bcrypt.compare(password, hash)
    console.log('🧪 [SIGMA_FIX] Teste de validação:', isValid)
    
    // Atualizar o utilizador Sigma
    console.log('💾 [SIGMA_FIX] Atualizando password do Sigma...')
    
    const { data: updateResult, error: updateError } = await supabaseClient
      .from('users')
      .update({ 
        password_hash: hash,
        tentativas_login: 0,
        bloqueado_ate: null,
        updated_at: new Date().toISOString()
      })
      .eq('username', 'Sigma')
      .select()

    if (updateError) {
      console.error('❌ [SIGMA_FIX] Erro ao atualizar:', updateError)
      throw updateError
    }

    console.log('✅ [SIGMA_FIX] Utilizador Sigma atualizado:', updateResult)

    // Verificar se funcionou
    const { data: sigmaUser, error: checkError } = await supabaseClient
      .from('users')
      .select('id, username, nome_completo, email, perfil_acesso, ativo, password_hash')
      .eq('username', 'Sigma')
      .single()

    if (checkError) {
      console.error('❌ [SIGMA_FIX] Erro ao verificar:', checkError)
      throw checkError
    }

    // Testar login
    const loginTest = await bcrypt.compare(password, sigmaUser.password_hash)
    console.log('🔐 [SIGMA_FIX] Teste de login:', loginTest)

    // Também criar hash para "password" (fallback)
    const simpleHash = await bcrypt.hash("password", 10)
    console.log('🔐 [SIGMA_FIX] Hash simples gerado:', simpleHash)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password do Sigma corrigida com sucesso',
        user: { ...sigmaUser, password_hash: undefined },
        original_password: password,
        hash_generated: hash,
        hash_test: isValid,
        login_test: loginTest,
        simple_hash: simpleHash
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [SIGMA_FIX] Erro:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})