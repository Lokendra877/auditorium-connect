import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/device-id';

/**
 * Attaches the browser's device id to every Data API request so database
 * row-level security policies can verify ownership of anonymous records
 * (queue entries, questions, votes, notifications).
 */
export function attachDeviceHeader() {
  const deviceId = getDeviceId();
  const targets: unknown[] = [(supabase as any).rest, supabase];

  for (const target of targets) {
    const headers = (target as any)?.headers;
    if (!headers) continue;
    if (typeof headers.set === 'function') {
      headers.set('x-device-id', deviceId);
    } else {
      headers['x-device-id'] = deviceId;
    }
  }
}
