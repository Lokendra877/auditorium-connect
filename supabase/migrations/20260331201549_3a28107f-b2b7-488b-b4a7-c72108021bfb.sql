
-- 1. Drop the overly permissive public SELECT policy
DROP POLICY "Anyone can view sessions" ON public.sessions;

-- 2. Create anon-specific SELECT policy
CREATE POLICY "Anon can view sessions"
ON public.sessions
FOR SELECT
TO anon
USING (true);

-- 3. Restrict anon column access (hide admin_code)
REVOKE SELECT ON public.sessions FROM anon;
GRANT SELECT (id, title, is_active, created_at, updated_at, speaking_time_seconds, current_speaker_id, speaker_started_at, user_id) ON public.sessions TO anon;

-- 4. Create RPC for quick session creation (returns admin_code securely via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_quick_session(p_title text, p_speaking_time integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_admin_code text;
BEGIN
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  IF p_speaking_time < 10 OR p_speaking_time > 300 THEN
    RAISE EXCEPTION 'Speaking time must be between 10 and 300 seconds';
  END IF;

  INSERT INTO public.sessions (title, speaking_time_seconds)
  VALUES (trim(p_title), p_speaking_time)
  RETURNING id, admin_code INTO v_session_id, v_admin_code;

  RETURN jsonb_build_object(
    'id', v_session_id,
    'admin_code', v_admin_code,
    'title', trim(p_title)
  );
END;
$$;

-- 5. Make audio-recordings bucket private
UPDATE storage.buckets SET public = false WHERE id = 'audio-recordings';
