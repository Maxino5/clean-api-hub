-- Atomically increments an account's usage counter only if it is still under
-- its plan limit, and reports whether the increment was allowed. Doing the
-- check-and-increment as one SQL statement (instead of a separate SELECT
-- then UPDATE from application code) closes a race condition where two
-- concurrent requests could both read the same "under limit" value and each
-- push the counter past the plan limit, or silently clobber each other's
-- increment.
CREATE OR REPLACE FUNCTION public.increment_usage_if_allowed(p_user_id UUID, p_limit INTEGER)
RETURNS TABLE(requests_used INTEGER, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.accounts
  SET requests_used = accounts.requests_used + 1,
      updated_at = now()
  WHERE accounts.user_id = p_user_id
    AND accounts.requests_used < p_limit
  RETURNING accounts.requests_used, true;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT accounts.requests_used, false
    FROM public.accounts
    WHERE accounts.user_id = p_user_id;
  END IF;
END;
$$;

-- Only the backend (service role) may call this. If authenticated users
-- could call it directly via PostgREST, they could pass any p_limit and
-- bypass their real plan quota entirely.
REVOKE ALL ON FUNCTION public.increment_usage_if_allowed(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_usage_if_allowed(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage_if_allowed(UUID, INTEGER) TO service_role;
