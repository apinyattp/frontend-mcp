// ── Enums ──────────────────────────────────────────────

export type Role = "ADMIN" | "USER";
export type GroupRole = "ADMIN" | "USER";

// ── Auth ───────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: Role;
  };
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  groups: UserGroup[];
}

export interface UserGroup {
  id: string;
  name: string;
  emoji: string | null;
  role: GroupRole;
}

// ── Users ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// ── Groups ─────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}

// ── Knowledge Bases ────────────────────────────────────

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  score?: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  group: {
    id: string;
    name: string;
    emoji: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// ── Stats ──────────────────────────────────────────────

export interface Stats {
  totalGroups: number;
  totalMembers: number;
  totalKnowledgeBases: number;
  newGroupsThisMonth: number;
  newMembersThisMonth: number;
}

// ── Pagination ─────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
