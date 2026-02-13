import type {
  AuthResponse,
  MeResponse,
  Group,
  GroupMember,
  KnowledgeBase,
  Stats,
  PaginatedResponse,
  Role,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ── Helpers ────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? res.statusText, res.status);
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────

export const auth = {
  googleLogin(idToken: string) {
    return request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  me() {
    return request<MeResponse>("/auth/me");
  },
};

// ── Groups ─────────────────────────────────────────────

export const groups = {
  findAll(params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<PaginatedResponse<Group>>(`/groups${qs ? `?${qs}` : ""}`);
  },

  findMine() {
    return request<{ data: { id: string; name: string; emoji: string | null; role: Role }[] }>(
      "/groups/mine",
    );
  },

  findOne(id: string) {
    return request<Group>(`/groups/${id}`);
  },

  create(data: { name: string; emoji?: string }) {
    return request<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: { name?: string; emoji?: string }) {
    return request<Group>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<void>(`/groups/${id}`, { method: "DELETE" });
  },

  getMembers(groupId: string) {
    return request<{ data: GroupMember[] }>(`/groups/${groupId}/members`);
  },

  addMember(groupId: string, data: { email: string }) {
    return request<GroupMember>(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMemberRole(groupId: string, userId: string, role: Role) {
    return request<GroupMember>(`/groups/${groupId}/members/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },

  removeMember(groupId: string, userId: string) {
    return request<void>(`/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};

// ── Knowledge Bases ────────────────────────────────────

export const knowledgeBases = {
  findAll(params?: {
    search?: string;
    groupId?: string;
    page?: number;
    limit?: number;
  }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.groupId) q.set("groupId", params.groupId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<PaginatedResponse<KnowledgeBase>>(
      `/knowledge-bases${qs ? `?${qs}` : ""}`,
    );
  },

  findOne(id: string) {
    return request<KnowledgeBase>(`/knowledge-bases/${id}`);
  },

  create(data: { title: string; groupId: string; content: string }) {
    return request<KnowledgeBase>("/knowledge-bases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: { title?: string; groupId?: string; content?: string },
  ) {
    return request<KnowledgeBase>(`/knowledge-bases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<void>(`/knowledge-bases/${id}`, { method: "DELETE" });
  },
};

// ── Stats ──────────────────────────────────────────────

export const stats = {
  get() {
    return request<Stats>("/stats");
  },
};
