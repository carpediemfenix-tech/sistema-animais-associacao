import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    if (req.method === 'POST') {
      const { password } = await req.json()
      
      console.log('🔐 [HASH] Gerando hash para password:', password)
      
      // Gerar hash bcrypt
      const hash = await bcrypt.hash(password, 10)
      
      console.log('✅ [HASH] Hash gerado:', hash)
      
      // Testar o hash
      const isValid = await bcrypt.compare(password, hash)
      
      console.log('🧪 [HASH] Teste de validação:', isValid)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          password,
          hash,
          test: isValid
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
    console.error('💥 [HASH] Erro:', error)
    
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