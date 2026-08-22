-- 1. Device identity + authority helpers (SECURITY INVOKER)
create or replace function public.current_device_id()
returns text language sql stable set search_path = public as $$
  select nullif(coalesce(current_setting('request.headers', true), '{}')::json ->> 'x-device-id', '')
$$;

create or replace function public.is_session_owner(_session_id uuid)
returns boolean language sql stable set search_path = public as $$
  select exists (
    select 1 from public.sessions s
    where s.id = _session_id and s.user_id is not null and s.user_id = auth.uid()
  )
$$;

create or replace function public.is_session_moderator(_session_id uuid)
returns boolean language sql stable set search_path = public as $$
  select public.current_device_id() is not null and exists (
    select 1 from public.speaker_queue q
    where q.session_id = _session_id
      and q.is_moderator
      and q.device_id = public.current_device_id()
  )
$$;

create or replace function public.can_manage_session(_session_id uuid)
returns boolean language sql stable set search_path = public as $$
  select public.is_session_owner(_session_id) or public.is_session_moderator(_session_id)
$$;

create or replace function public.can_control_mic(_session_id uuid)
returns boolean language sql stable set search_path = public as $$
  select public.can_manage_session(_session_id)
    or (public.current_device_id() is not null and exists (
      select 1 from public.speaker_queue q
      where q.session_id = _session_id
        and q.device_id = public.current_device_id()
        and q.status = 'speaking'
    ))
$$;

grant execute on function public.current_device_id() to anon, authenticated;
grant execute on function public.is_session_owner(uuid) to anon, authenticated;
grant execute on function public.is_session_moderator(uuid) to anon, authenticated;
grant execute on function public.can_manage_session(uuid) to anon, authenticated;
grant execute on function public.can_control_mic(uuid) to anon, authenticated;

-- 2. Lock down SECURITY DEFINER trigger helpers (not meant to be API-callable)
revoke all on function public.notify_new_signup() from anon, authenticated;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.notify_new_session() from anon, authenticated;
revoke all on function public.create_quick_session(text, integer) from authenticated;

-- 3. sessions: hide admin_code from anonymous visitors, restrict updates
revoke select on public.sessions from anon;
grant select (id, title, is_active, speaking_time_seconds, current_speaker_id, speaker_started_at, created_at, updated_at, user_id)
  on public.sessions to anon;

drop policy if exists "Anyone can update sessions" on public.sessions;
create policy "Session hosts, moderators or active speaker can update session"
  on public.sessions for update to anon, authenticated
  using (public.can_control_mic(id))
  with check (public.can_control_mic(id));

-- 4. speaker_queue: hide participant emails from anonymous visitors, ownership checks
revoke select on public.speaker_queue from anon;
grant select (id, session_id, user_name, device_id, position, status, requested_at, started_speaking_at, finished_speaking_at, is_moderator)
  on public.speaker_queue to anon;

drop policy if exists "Anyone can update queue" on public.speaker_queue;
drop policy if exists "Anyone can delete from queue" on public.speaker_queue;
create policy "Own entry or session host can update queue"
  on public.speaker_queue for update to anon, authenticated
  using (device_id = public.current_device_id() or public.can_manage_session(session_id))
  with check (device_id = public.current_device_id() or public.can_manage_session(session_id));
create policy "Own entry or session host can delete queue"
  on public.speaker_queue for delete to anon, authenticated
  using (device_id = public.current_device_id() or public.can_manage_session(session_id));

-- 5. audience_questions
drop policy if exists "Anyone can update questions" on public.audience_questions;
create policy "Own question or session host can update"
  on public.audience_questions for update to anon, authenticated
  using (device_id = public.current_device_id() or public.can_manage_session(session_id))
  with check (device_id = public.current_device_id() or public.can_manage_session(session_id));

-- 6. question_upvotes
drop policy if exists "Anyone can remove upvote" on public.question_upvotes;
create policy "Only own upvotes can be removed"
  on public.question_upvotes for delete to anon, authenticated
  using (device_id = public.current_device_id());

-- 7. poll_votes
drop policy if exists "Anyone can update own votes" on public.poll_votes;
drop policy if exists "Anyone can delete own votes" on public.poll_votes;
create policy "Only own votes can be updated"
  on public.poll_votes for update to anon, authenticated
  using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());
create policy "Own votes or session host can delete votes"
  on public.poll_votes for delete to anon, authenticated
  using (
    device_id = public.current_device_id()
    or exists (select 1 from public.session_polls p where p.id = poll_id and public.can_manage_session(p.session_id))
  );

-- 8. session_polls
drop policy if exists "Anyone can update polls" on public.session_polls;
drop policy if exists "Anyone can delete polls" on public.session_polls;
create policy "Session hosts can update polls"
  on public.session_polls for update to anon, authenticated
  using (public.can_manage_session(session_id) or (closes_at is not null and closes_at < now()))
  with check (public.can_manage_session(session_id) or (closes_at is not null and closes_at < now()));
create policy "Session hosts can delete polls"
  on public.session_polls for delete to anon, authenticated
  using (public.can_manage_session(session_id));

-- 9. audio_recordings
drop policy if exists "Anyone can delete recordings" on public.audio_recordings;
create policy "Session hosts can delete recordings"
  on public.audio_recordings for delete to anon, authenticated
  using (public.can_manage_session(session_id));

-- 10. admin_notifications: only the system (service role) or the owner may create
drop policy if exists "Anyone can create notifications" on public.admin_notifications;
create policy "Users can create their own notifications"
  on public.admin_notifications for insert to authenticated
  with check (user_id = auth.uid());

-- 11. demo_requests: contact details are no longer readable by any signed-in user
drop policy if exists "Authenticated users can view demo requests" on public.demo_requests;
revoke select on public.demo_requests from anon, authenticated;

-- 12. user_notifications: only the target device
drop policy if exists "Anyone can view own notifications" on public.user_notifications;
drop policy if exists "Anyone can update notifications" on public.user_notifications;
create policy "Only target device can view notifications"
  on public.user_notifications for select to anon, authenticated
  using (device_id = public.current_device_id());
create policy "Only target device can update notifications"
  on public.user_notifications for update to anon, authenticated
  using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());

-- 13. storage: audio recordings only for the session host
drop policy if exists "Anyone can read audio recordings" on storage.objects;
drop policy if exists "Anyone can upload audio recordings" on storage.objects;
create policy "Session hosts can read audio recordings"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'audio-recordings'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_session_owner((split_part(name, '/', 1))::uuid)
  );
create policy "Session hosts can upload audio recordings"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'audio-recordings'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_session_owner((split_part(name, '/', 1))::uuid)
  );
create policy "Session hosts can delete audio recordings"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'audio-recordings'
    and name ~ '^[0-9a-fA-F-]{36}/'
    and public.is_session_owner((split_part(name, '/', 1))::uuid)
  );