import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔐 [SIGMA] Gerando hash para password do Sigma...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente em falta')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    
    if (req.method === 'POST') {
      // Gerar hash para "V@ngelis1973"
      const password = "V@ngelis1973"
      console.log('🔐 [SIGMA] Gerando hash para password:', password)
      
      // Gerar hash bcrypt
      const hash = await bcrypt.hash(password, 10)
      console.log('✅ [SIGMA] Hash gerado:', hash)
      
      // Testar o hash
      const isValid = await bcrypt.compare(password, hash)
      console.log('🧪 [SIGMA] Teste de validação:', isValid)
      
      // Atualizar o utilizador Sigma com o hash correto
      console.log('💾 [SIGMA] Atualizando password do utilizador Sigma...')
      
      const { data: updateResult, error: updateError } = await supabaseClient
        .from('users')
        .update({ 
          password_hash: hash,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'Sigma')
        .select()

      if (updateError) {
        console.error('❌ [SIGMA] Erro ao atualizar:', updateError)
        throw updateError
      }

      console.log('✅ [SIGMA] Utilizador Sigma atualizado:', updateResult)

      // Verificar se a atualização funcionou
      const { data: sigmaUser, error: checkError } = await supabaseClient
        .from('users')
        .select('id, username, nome_completo, email, perfil_acesso, ativo')
        .eq('username', 'Sigma')
        .single()

      if (checkError) {
        console.error('❌ [SIGMA] Erro ao verificar utilizador:', checkError)
        throw checkError
      }

      console.log('👤 [SIGMA] Utilizador verificado:', sigmaUser)

      // Testar login do Sigma
      console.log('🧪 [SIGMA] Testando login...')
      const { data: loginTest, error: loginError } = await supabaseClient
        .from('users')
        .select('password_hash')
        .eq('username', 'Sigma')
        .single()

      if (loginTest) {
        const loginValid = await bcrypt.compare(password, loginTest.password_hash)
        console.log('🔐 [SIGMA] Teste de login:', loginValid)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Utilizador Sigma criado e configurado com sucesso',
          user: sigmaUser,
          hash_generated: hash,
          hash_test: isValid,
          login_test: loginTest ? await bcrypt.compare(password, loginTest.password_hash) : false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Método não permitido' 
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [SIGMA] Erro:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})