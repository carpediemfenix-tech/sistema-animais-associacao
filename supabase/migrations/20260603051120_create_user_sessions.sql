-- Backend-validatable sessions for the custom authentication flow.
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  last_used_at timestamptz null,
  user_agent text null,
  ip_address text null,
  constraint user_sessions_token_hash_not_empty check (length(btrim(token_hash)) > 0),
  constraint user_sessions_expires_after_created check (expires_at > created_at)
);

alter table public.user_sessions enable row level security;

create unique index if not exists idx_user_sessions_token_hash
  on public.user_sessions (token_hash);

create index if not exists idx_user_sessions_user_id
  on public.user_sessions (user_id);

create index if not exists idx_user_sessions_expires_at
  on public.user_sessions (expires_at);

create index if not exists idx_user_sessions_active_token
  on public.user_sessions (token_hash)
  where revoked_at is null;
