import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OpsEvent, OpsEventLevel, OpsEventType } from "@/lib/ops-events";

type RecordInput = { source: string; eventType: OpsEventType; level: OpsEventLevel; message: string; payload?: Record<string, unknown>; happenedAt?: string };
type ListFilters = { limit?: number; level?: OpsEventLevel | "all"; source?: string; query?: string };

let cachedClient: SupabaseClient | null = null;

function getOpsClient() {
  const url = process.env.GEEF_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.GEEF_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing Supabase URL for ops events.");
  if (!serviceRoleKey) throw new Error("Missing Supabase service role key for ops events.");
  cachedClient ??= createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return cachedClient;
}

export async function recordOpsEventRecord(input: RecordInput) {
  const { data, error } = await getOpsClient().from("ops_events").insert({
    source: input.source, event_type: input.eventType, level: input.level, message: input.message,
    payload: input.payload ?? {}, happened_at: input.happenedAt ?? new Date().toISOString(),
  }).select("id, source, event_type, level, message, payload, happened_at, created_at").single();
  if (error) throw error;
  return data as OpsEvent;
}

export async function listOpsEventRecords(filters: ListFilters = {}) {
  const limit = filters.limit && !Number.isNaN(filters.limit) ? Math.max(1, Math.min(filters.limit, 200)) : 50;
  let query = getOpsClient().from("ops_events").select("id, source, event_type, level, message, payload, happened_at, created_at").order("created_at", { ascending: false }).limit(limit);
  if (filters.level && filters.level !== "all") query = query.eq("level", filters.level);
  if (filters.source) query = query.ilike("source", `%${filters.source}%`);
  if (filters.query) query = query.ilike("message", `%${filters.query}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as OpsEvent[];
}
