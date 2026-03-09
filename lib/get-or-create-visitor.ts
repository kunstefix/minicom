import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import { ensureVisitorProfile } from "@/lib/supabase/queries";
import { loadVisitorId, saveVisitorId } from "@/lib/session";
import type { Participant } from "@/types/chat";

/**
 * Read local visitor id, or create one and upsert profile in Supabase, then persist and return participant.
 */
export async function getOrCreateVisitor(
  displayName?: string | null
): Promise<Participant> {
  let visitorId = loadVisitorId();
  if (!visitorId) {
    visitorId = nanoid();
    saveVisitorId(visitorId);
  }
  const supabase = createClient();
  return ensureVisitorProfile(supabase, visitorId, displayName);
}
