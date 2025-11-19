import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface CreateUserRequest {
  username: string
  email: string
  password: string
  nome_completo: string
  perfil_acesso: 'administrador' | 'tecnico' | 'consulta'
  ativo?: boolean
  current_user_id: string
}

interface UpdateUserRequest {
  id: string
  username?: string
  email?: string
  nome_completo?: string
  perfil_acesso?: 'administrador' | 'tecnico' | 'consulta'
  ativo?: boolean
  current_user_id: string
}

interface ResetPasswordRequest {
  user_id: string
  new_password: string
  current_user_id: string
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

    const url = new URL(req.url)
    const method = req.method

    // Verificar se o utilizador atual é administrador
    const checkAdminPermission = async (userId: string) => {
      const { data: user } = await supabaseClient
        .from('users')
        .select('perfil_acesso, ativo')
        .eq('id', userId)
        .single()

      return user?.perfil_acesso === 'administrador' && user?.ativo === true
    }

    // GET - Listar utilizadores
    if (method === 'GET') {
      const currentUserId = url.searchParams.get('current_user_id')
      
      if (!currentUserId || !(await checkAdminPermission(currentUserId))) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acesso negado. Apenas administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: users, error } = await supabaseClient
        .from('users')
        .select(`
          id,
          username,
          email,
          nome_completo,
          perfil_acesso,
          ativo,
          ultimo_login,
          tentativas_login,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [USER_MGMT] Erro ao buscar utilizadores:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar utilizadores' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, users }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Criar utilizador
    if (method === 'POST') {
      const { 
        username, 
        email, 
        password, 
        nome_completo, 
        perfil_acesso, 
        ativo = true,
        current_user_id 
      }: CreateUserRequest = await req.json()

      if (!current_user_id || !(await checkAdminPermission(current_user_id))) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acesso negado. Apenas administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validações
      if (!username || !email || !password || !nome_completo || !perfil_acesso) {
        return new Response(
          JSON.stringify({ success: false, error: 'Todos os campos são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ success: false, error: 'Password deve ter pelo menos 6 caracteres' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verificar se username já existe
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: 'Username já existe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Encriptar password
      const passwordHash = await bcrypt.hash(password, 10)

      // Criar utilizador
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert({
          username,
          email,
          password_hash: passwordHash,
          nome_completo,
          perfil_acesso,
          ativo,
          created_by: current_user_id,
          updated_by: current_user_id
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ [USER_MGMT] Erro ao criar utilizador:', createError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao criar utilizador' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log da criação
      await supabaseClient.from('activity_logs').insert({
        user_id: current_user_id,
        acao: 'CREATE',
        tabela: 'users',
        registro_id: newUser.id,
        dados_novos: { username, email, nome_completo, perfil_acesso, ativo }
      })

      console.log('✅ [USER_MGMT] Utilizador criado:', username)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { ...newUser, password_hash: undefined },
          message: 'Utilizador criado com sucesso'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Atualizar utilizador
    if (method === 'PUT') {
      const { 
        id, 
        username, 
        email, 
        nome_completo, 
        perfil_acesso, 
        ativo,
        current_user_id 
      }: UpdateUserRequest = await req.json()

      if (!current_user_id || !(await checkAdminPermission(current_user_id))) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acesso negado. Apenas administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID do utilizador é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados anteriores para auditoria
      const { data: oldUser } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (!oldUser) {
        return new Response(
          JSON.stringify({ success: false, error: 'Utilizador não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Preparar dados para atualização
      const updateData: any = { updated_by: current_user_id }
      if (username !== undefined) updateData.username = username
      if (email !== undefined) updateData.email = email
      if (nome_completo !== undefined) updateData.nome_completo = nome_completo
      if (perfil_acesso !== undefined) updateData.perfil_acesso = perfil_acesso
      if (ativo !== undefined) updateData.ativo = ativo

      // Atualizar utilizador
      const { data: updatedUser, error: updateError } = await supabaseClient
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ [USER_MGMT] Erro ao atualizar utilizador:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao atualizar utilizador' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log da atualização
      await supabaseClient.from('activity_logs').insert({
        user_id: current_user_id,
        acao: 'UPDATE',
        tabela: 'users',
        registro_id: id,
        dados_anteriores: { ...oldUser, password_hash: undefined },
        dados_novos: updateData
      })

      console.log('✅ [USER_MGMT] Utilizador atualizado:', username || oldUser.username)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { ...updatedUser, password_hash: undefined },
          message: 'Utilizador atualizado com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH - Reset password
    if (method === 'PATCH') {
      const { user_id, new_password, current_user_id }: ResetPasswordRequest = await req.json()

      if (!current_user_id || !(await checkAdminPermission(current_user_id))) {
        return new Response(
          JSON.stringify({ success: false, error: 'Acesso negado. Apenas administradores.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!user_id || !new_password) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID do utilizador e nova password são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (new_password.length < 6) {
        return new Response(
          JSON.stringify({ success: false, error: 'Password deve ter pelo menos 6 caracteres' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Encriptar nova password
      const passwordHash = await bcrypt.hash(new_password, 10)

      // Atualizar password
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ 
          password_hash: passwordHash,
          tentativas_login: 0,
          bloqueado_ate: null,
          updated_by: current_user_id
        })
        .eq('id', user_id)

      if (updateError) {
        console.error('❌ [USER_MGMT] Erro ao resetar password:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao resetar password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log do reset de password
      await supabaseClient.from('activity_logs').insert({
        user_id: current_user_id,
        acao: 'UPDATE',
        tabela: 'users',
        registro_id: user_id,
        dados_novos: { acao: 'password_reset' }
      })

      console.log('✅ [USER_MGMT] Password resetada para utilizador:', user_id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password resetada com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Método não permitido
    return new Response(
      JSON.stringify({ success: false, error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 [USER_MGMT] Erro interno:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})