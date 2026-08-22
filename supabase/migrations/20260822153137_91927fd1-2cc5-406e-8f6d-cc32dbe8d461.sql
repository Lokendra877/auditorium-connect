-- Make the public quick-session RPC run with the caller's own privileges
create or replace function public.create_quick_session(p_title text, p_speaking_time integer default 30)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session_id uuid;
  v_admin_code text := substr(md5(gen_random_uuid()::text), 1, 8);
begin
  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'Title is required';
  end if;
  if p_speaking_time < 10 or p_speaking_time > 300 then
    raise exception 'Speaking time must be between 10 and 300 seconds';
  end if;

  insert into public.sessions (title, speaking_time_seconds, admin_code)
  values (left(trim(p_title), 120), p_speaking_time, v_admin_code)
  returning id into v_session_id;

  return jsonb_build_object('id', v_session_id, 'admin_code', v_admin_code, 'title', left(trim(p_title), 120));
end;
$$;

-- Internal trigger helpers must not be callable through the API
revoke all on function public.notify_new_signup() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.notify_new_session() from public, anon, authenticated;

revoke all on function public.create_quick_session(text, integer) from public;
grant execute on function public.create_quick_session(text, integer) to anon, authenticated;