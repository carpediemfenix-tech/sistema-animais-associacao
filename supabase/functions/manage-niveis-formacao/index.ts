import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)

    switch (method) {
      case 'GET':
        // Listar níveis de formação
        const { data: niveis, error: getNiveisError } = await supabaseAdmin
          .from('niveis_formacao')
          .select('*')
          .order('ordem')

        if (getNiveisError) throw getNiveisError

        return new Response(
          JSON.stringify({ success: true, data: niveis }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      case 'POST':
        // Criar novo nível de formação
        const nivelData = await req.json()
        
        const { data: newNivel, error: insertError } = await supabaseAdmin
          .from('niveis_formacao')
          .insert([nivelData])
          .select()
          .single()

        if (insertError) throw insertError

        return new Response(
          JSON.stringify({ success: true, data: newNivel }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201 
          }
        )

      case 'PUT':
        // Atualizar nível de formação
        const id = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const { data: updatedNivel, error: updateError } = await supabaseAdmin
          .from('niveis_formacao')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ success: true, data: updatedNivel }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      case 'DELETE':
        // Deletar nível de formação
        const deleteId = pathSegments[pathSegments.length - 1]
        
        const { error: deleteError } = await supabaseAdmin
          .from('niveis_formacao')
          .delete()
          .eq('id', deleteId)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405 
          }
        )
    }

  } catch (error) {
    console.error('Error in manage-niveis-formacao function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
