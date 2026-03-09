import { createClient } from "@/lib/supabase/client";
import { getAgentProfile } from "@/lib/supabase/queries";
import type { Participant } from "@/types/chat";

const DEMO_AGENT_ID = "demo-agent";

/**
 * Fetch the seeded demo agent. Returns null if not found (run supabase/seed.sql).
 */
export async function getDefaultAgent(): Promise<Participant | null> {
  const supabase = createClient();
  return getAgentProfile(supabase, DEMO_AGENT_ID);
}
