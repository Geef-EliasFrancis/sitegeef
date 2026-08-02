import { listOpsEventRecords, recordOpsEventRecord } from "@/lib/ops-events-repository";

export type OpsEventLevel = "debug" | "info" | "warn" | "error";
export type OpsEventType = "log" | "heartbeat" | "weekly_report";

export type OpsEvent = {
  id: number;
  source: string;
  event_type: OpsEventType;
  level: OpsEventLevel;
  message: string;
  payload: Record<string, unknown>;
  happened_at: string;
  created_at: string;
};

type RecordOpsEventInput = {
  source: string;
  eventType: OpsEventType;
  level: OpsEventLevel;
  message: string;
  payload?: Record<string, unknown>;
  happenedAt?: string;
};

type ListOpsEventsFilters = {
  limit?: number;
  level?: OpsEventLevel | "all";
  source?: string;
  query?: string;
};

export async function recordOpsEvent(input: RecordOpsEventInput) {
  return recordOpsEventRecord(input);
}

export async function listOpsEvents(filters: ListOpsEventsFilters = {}) {
  return listOpsEventRecords(filters);
}

export async function getOpsEventStats(events: OpsEvent[]) {
  const last24hThreshold = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = events.filter((event) => new Date(event.created_at).getTime() >= last24hThreshold);

  return {
    total: events.length,
    last24h: last24h.length,
    errors: events.filter((event) => event.level === "error").length,
    warnings: events.filter((event) => event.level === "warn").length,
    sources: new Set(events.map((event) => event.source)).size,
  };
}
