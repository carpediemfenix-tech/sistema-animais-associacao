import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface LoginRequest {
  username: string
  password: string
  ip_address?: string
  user_agent?: string
}

interface User {
  id: string
  username: string
  email: string
  password_hash: string
  nome_completo: string
  perfil_acesso: string
  ativo: boolean
  tentativas_login: number
  bloqueado_ate: string | null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { username, password, ip_address, user_agent }: LoginRequest = await req.json()

      console.log('🔐 [AUTH] Tentativa de login:', { username, ip_address })

      // Validar dados de entrada
      if (!username || !password) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Username e password são obrigatórios' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar utilizador
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError || !user) {
        console.log('❌ [AUTH] Utilizador não encontrado:', username)
        
        // Log da tentativa falhada
        await supabaseClient.from('activity_logs').insert({
          acao: 'LOGIN_FAILED',
          tabela: 'users',
          dados_novos: { username, motivo: 'utilizador_nao_encontrado' },
          ip_address,
          user_agent
        })

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Credenciais inválidas' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const userData = user as User

      // Verificar se utilizador está ativo
      if (!userData.ativo) {
        console.log('❌ [AUTH] Utilizador inativo:', username)
        
        await supabaseClient.from('activity_logs').insert({
          user_id: userData.id,
          acao: 'LOGIN_FAILED',
          tabela: 'users',
          dados_novos: { username, motivo: 'utilizador_inativo' },
          ip_address,
          user_agent
        })

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Conta desativada. Contacte o administrador.' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar se utilizador está bloqueado
      if (userData.bloqueado_ate && new Date(userData.bloqueado_ate) > new Date()) {
        console.log('❌ [AUTH] Utilizador bloqueado:', username)
        
        await supabaseClient.from('activity_logs').insert({
          user_id: userData.id,
          acao: 'LOGIN_FAILED',
          tabela: 'users',
          dados_novos: { username, motivo: 'utilizador_bloqueado' },
          ip_address,
          user_agent
        })

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Conta bloqueada até ${new Date(userData.bloqueado_ate).toLocaleString('pt-PT')}` 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verificar password
      const passwordMatch = await bcrypt.compare(password, userData.password_hash)

      if (!passwordMatch) {
        console.log('❌ [AUTH] Password incorreta:', username)
        
        // Incrementar tentativas de login
        const novasTentativas = (userData.tentativas_login || 0) + 1
        let bloqueadoAte = null

        // Bloquear após 5 tentativas falhadas
        if (novasTentativas >= 5) {
          bloqueadoAte = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
          console.log('🚫 [AUTH] Utilizador bloqueado por tentativas excessivas:', username)
        }

        await supabaseClient
          .from('users')
          .update({ 
            tentativas_login: novasTentativas,
            bloqueado_ate: bloqueadoAte?.toISOString()
          })
          .eq('id', userData.id)

        await supabaseClient.from('activity_logs').insert({
          user_id: userData.id,
          acao: 'LOGIN_FAILED',
          tabela: 'users',
          dados_novos: { 
            username, 
            motivo: 'password_incorreta',
            tentativas: novasTentativas,
            bloqueado: !!bloqueadoAte
          },
          ip_address,
          user_agent
        })

        const errorMessage = novasTentativas >= 5 
          ? 'Muitas tentativas falhadas. Conta bloqueada por 30 minutos.'
          : `Credenciais inválidas. Tentativa ${novasTentativas}/5`

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Login bem-sucedido
      console.log('✅ [AUTH] Login bem-sucedido:', username)

      // Resetar tentativas e atualizar último login
      await supabaseClient
        .from('users')
        .update({ 
          tentativas_login: 0,
          bloqueado_ate: null,
          ultimo_login: new Date().toISOString()
        })
        .eq('id', userData.id)

      // Log do login bem-sucedido
      await supabaseClient.from('activity_logs').insert({
        user_id: userData.id,
        acao: 'LOGIN',
        tabela: 'users',
        dados_novos: { username, perfil_acesso: userData.perfil_acesso },
        ip_address,
        user_agent
      })

      // Retornar dados do utilizador (sem password)
      const { password_hash, ...userWithoutPassword } = userData

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: userWithoutPassword,
          message: 'Login realizado com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Método não permitido
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
    console.error('💥 [AUTH] Erro interno:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})