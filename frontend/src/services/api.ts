/**
 * Reusable API client for the ReSpark FastAPI backend.
 * Base URL configurable via VITE_API_URL (see .env.example).
 */
import type {
  DashboardStats,
  GenerateMatchesResult,
  ImpactStats,
  Match,
  MatchStatus,
  Need,
  Resource,
  User,
} from "../types";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      ...options,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the ReSpark backend. Is it running on port 8000?");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) {
        detail = body.detail.map((e: { loc: unknown[]; msg: string }) => `${e.loc?.slice(1).join(".")}: ${e.msg}`).join("; ");
      }
    } catch {
      /* keep statusText */
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// ---------------------------------------------------------------- Health
export const api = {
  health: () =>
    request<{ status: string; service: string; tagline: string; version: string; demo_mode: boolean }>("/health"),

  // ---------------------------------------------------------------- Users
  listUsers: () => request<User[]>("/users"),
  getUser: (id: number) => request<User>(`/users/${id}`),

  // -------------------------------------------------------------- Resources
  listResources: (filters: {
    q?: string;
    category?: string;
    resource_type?: string;
    condition?: string;
    availability?: string;
    location?: string;
    provider_id?: number;
  } = {}) => request<Resource[]>(`/resources${qs(filters)}`),
  getResource: (id: number) => request<Resource>(`/resources/${id}`),
  createResource: (payload: Record<string, unknown>) =>
    request<Resource>("/resources", { method: "POST", body: JSON.stringify(payload) }),
  updateResource: (id: number, payload: Record<string, unknown>) =>
    request<Resource>(`/resources/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deactivateResource: (id: number) =>
    request<{ message: string }>(`/resources/${id}`, { method: "DELETE" }),

  // ----------------------------------------------------------------- Needs
  listNeeds: (filters: {
    q?: string;
    category?: string;
    resource_type?: string;
    urgency?: string;
    status?: string;
    location?: string;
    requester_id?: number;
  } = {}) => request<Need[]>(`/needs${qs(filters)}`),
  getNeed: (id: number) => request<Need>(`/needs/${id}`),
  createNeed: (payload: Record<string, unknown>) =>
    request<Need>("/needs", { method: "POST", body: JSON.stringify(payload) }),
  updateNeed: (id: number, payload: Record<string, unknown>) =>
    request<Need>(`/needs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  cancelNeed: (id: number) => request<{ message: string }>(`/needs/${id}`, { method: "DELETE" }),

  // --------------------------------------------------------------- Matches
  listMatches: (filters: { status?: MatchStatus; resource_id?: number; need_id?: number; min_score?: number } = {}) =>
    request<Match[]>(`/matches${qs(filters)}`),
  getMatch: (id: number) => request<Match>(`/matches/${id}`),
  generateMatches: (minScore = 30) =>
    request<GenerateMatchesResult>(`/matches/generate${qs({ min_score: minScore })}`, { method: "POST" }),
  matchAction: (id: number, status: MatchStatus, notes?: string) =>
    request<Match>(`/matches/${id}/action`, { method: "POST", body: JSON.stringify({ status, notes }) }),

  // ----------------------------------------------------------------- Stats
  dashboardStats: () => request<DashboardStats>("/stats/dashboard"),
  impactStats: () => request<ImpactStats>("/stats/impact"),
};
