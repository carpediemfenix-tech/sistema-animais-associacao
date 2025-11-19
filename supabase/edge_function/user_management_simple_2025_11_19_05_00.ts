import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('👥 [USER_SIMPLE] Iniciando gestão simplificada...')
    
    // Verificar ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [USER_SIMPLE] Ambiente não configurado')
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const method = req.method
    
    console.log('📥 [USER_SIMPLE] Método:', method)

    // GET - Listar utilizadores
    if (method === 'GET') {
      console.log('📋 [USER_SIMPLE] Listando utilizadores...')
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, email, nome_completo, perfil_acesso, ativo, ultimo_login, tentativas_login, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [USER_SIMPLE] Erro ao listar:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar utilizadores' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ [USER_SIMPLE] Utilizadores encontrados:', users?.length || 0)
      return new Response(
        JSON.stringify({ success: true, users }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Criar utilizador
    if (method === 'POST') {
      const body = await req.json()
      console.log('➕ [USER_SIMPLE] Criando utilizador:', body.username)

      const { username, email, password, nome_completo, perfil_acesso, ativo = true } = body

      // Validações básicas
      if (!username || !email || !password || !nome_completo || !perfil_acesso) {
        console.log('❌ [USER_SIMPLE] Campos obrigatórios em falta')
        return new Response(
          JSON.stringify({ success: false, error: 'Todos os campos são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verificar duplicados
      console.log('🔍 [USER_SIMPLE] Verificando duplicados...')
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .or(`username.eq.${username},email.eq.${email}`)
        .limit(1)

      if (existing && existing.length > 0) {
        console.log('❌ [USER_SIMPLE] Username ou email já existe')
        return new Response(
          JSON.stringify({ success: false, error: 'Username ou email já existe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Gerar hash da password
      console.log('🔐 [USER_SIMPLE] Gerando hash...')
      let passwordHash
      try {
        passwordHash = await bcrypt.hash(password, 10)
        console.log('✅ [USER_SIMPLE] Hash gerado com sucesso')
      } catch (hashError) {
        console.error('❌ [USER_SIMPLE] Erro no hash:', hashError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao processar password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Inserir utilizador
      console.log('💾 [USER_SIMPLE] Inserindo na base de dados...')
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username,
          email,
          password_hash: passwordHash,
          nome_completo,
          perfil_acesso,
          ativo,
          tentativas_login: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, username, email, nome_completo, perfil_acesso, ativo')
        .single()

      if (insertError) {
        console.error('❌ [USER_SIMPLE] Erro ao inserir:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao criar utilizador',
            details: insertError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ [USER_SIMPLE] Utilizador criado:', newUser.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: newUser,
          message: 'Utilizador criado com sucesso'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Atualizar utilizador
    if (method === 'PUT') {
      const body = await req.json()
      console.log('✏️ [USER_SIMPLE] Atualizando utilizador:', body.id)

      const { id, username, email, nome_completo, perfil_acesso, ativo } = body

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: any = { updated_at: new Date().toISOString() }
      if (username !== undefined) updateData.username = username
      if (email !== undefined) updateData.email = email
      if (nome_completo !== undefined) updateData.nome_completo = nome_completo
      if (perfil_acesso !== undefined) updateData.perfil_acesso = perfil_acesso
      if (ativo !== undefined) updateData.ativo = ativo

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, username, email, nome_completo, perfil_acesso, ativo')
        .single()

      if (updateError) {
        console.error('❌ [USER_SIMPLE] Erro ao atualizar:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao atualizar utilizador' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ [USER_SIMPLE] Utilizador atualizado:', updatedUser.username)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: updatedUser,
          message: 'Utilizador atualizado com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH - Reset password
    if (method === 'PATCH') {
      const body = await req.json()
      console.log('🔑 [USER_SIMPLE] Reset password:', body.user_id)

      const { user_id, new_password } = body

      if (!user_id || !new_password) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID e nova password são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Gerar hash da nova password
      let passwordHash
      try {
        passwordHash = await bcrypt.hash(new_password, 10)
      } catch (hashError) {
        console.error('❌ [USER_SIMPLE] Erro no hash:', hashError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao processar password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: resetError } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          tentativas_login: 0,
          bloqueado_ate: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)

      if (resetError) {
        console.error('❌ [USER_SIMPLE] Erro no reset:', resetError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao resetar password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ [USER_SIMPLE] Password resetada')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password resetada com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 [USER_SIMPLE] Erro geral:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})