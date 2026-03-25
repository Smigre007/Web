-- Idempotente: garante que a API (service role) pode chamar o rate limiter.
grant execute on function public.upsert_rate_limit(text, bigint, timestamptz, timestamptz) to service_role;
