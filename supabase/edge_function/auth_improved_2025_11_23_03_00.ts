import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name",
};

const invalidCredentialsResponse = (status = 401) =>
  new Response(
    JSON.stringify({ success: false, error: "Credenciais inválidas." }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );

const isValidBcryptHash = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/.test(value);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[AUTH] Iniciando autenticação.");

    const { username, password } = await req.json();

    if (!username || !password) {
      return invalidCredentialsResponse(400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("ativo", true)
      .single();

    if (userError || !user) {
      console.log("[AUTH] Credenciais inválidas.");
      return invalidCredentialsResponse();
    }

    if (!isValidBcryptHash(user.password_hash)) {
      console.log("[AUTH] Credenciais inválidas.");
      return invalidCredentialsResponse();
    }

    let passwordValid = false;

    try {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } catch {
      console.log("[AUTH] Credenciais inválidas.");
      return invalidCredentialsResponse();
    }

    if (!passwordValid) {
      console.log("[AUTH] Credenciais inválidas.");
      return invalidCredentialsResponse();
    }

    console.log("[AUTH] Login bem-sucedido.");

    await supabase
      .from("users")
      .update({ ultimo_login: new Date().toISOString() })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nome_completo: user.nome_completo,
          perfil_acesso: user.perfil_acesso,
          ativo: user.ativo,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch {
    console.error("[AUTH] Erro interno na autenticação.");
    return invalidCredentialsResponse(500);
  }
});
