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

const SESSION_DURATION_HOURS = 12;
const SESSION_TOKEN_BYTES = 32;

const isValidBcryptHash = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/.test(value);
};

const base64UrlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const generateSessionToken = (): string => {
  const bytes = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
};

const sha256Hex = async (value: string): Promise<string> => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getClientIpAddress = (req: Request): string | null => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip");
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

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000,
    ).toISOString();
    const sessionToken = generateSessionToken();
    const tokenHash = await sha256Hex(sessionToken);

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        created_at: now.toISOString(),
        expires_at: expiresAt,
        user_agent: req.headers.get("user-agent"),
        ip_address: getClientIpAddress(req),
      });

    if (sessionError) {
      console.error("[AUTH] Erro ao criar sessao.");
      return invalidCredentialsResponse(500);
    }

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
        session_token: sessionToken,
        expires_at: expiresAt,
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
