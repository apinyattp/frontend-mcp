"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchIcon, PlusIcon, MoreIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { knowledgeBases as kbApi, groups as groupsApi, ApiError } from "@/lib/api";
import type { KnowledgeBase, Group } from "@/lib/types";
import { getInitials, getAvatarGradient, getGroupColor, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/toast";

export default function KnowledgeBasesPage() {
  const { user, userGroups } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState<{ id: string; name: string }[]>([]);

  // Admin: fetch all groups for filter chips
  useEffect(() => {
    if (isAdmin) {
      groupsApi
        .findAll({ limit: 100 })
        .then((res) => setAllGroups(res.data.map((g) => ({ id: g.id, name: g.name }))))
        .catch(() => {});
    }
  }, [isAdmin]);

  const filterGroups = isAdmin ? allGroups : userGroups;
  const filters = ["All", ...filterGroups.map((g) => g.name)];

  const fetchKbs = useCallback(async () => {
    setLoading(true);
    try {
      const groupId =
        activeFilter !== "All"
          ? filterGroups.find((g) => g.name === activeFilter)?.id
          : undefined;
      const res = await kbApi.findAll({
        search: search || undefined,
        groupId,
        limit: 100,
      });
      setKbs(res.data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load knowledge bases", "error");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search, filterGroups, showToast]);

  useEffect(() => {
    const timer = setTimeout(fetchKbs, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchKbs, search]);

  return (
    <>
      {/* Topbar */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-border bg-bg-deep/60 backdrop-blur-[12px] sticky top-0 z-10">
        <div>
          <h2 className="font-serif text-[1.3rem] font-medium">Knowledge Bases</h2>
          <p className="text-[0.82rem] text-text-secondary mt-0.5">
            Browse and manage your team&apos;s shared knowledge
          </p>
        </div>
        <Link
          href="/knowledge-bases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light hover:border-accent-light hover:shadow-[0_4px_20px_var(--color-accent-glow)] hover:-translate-y-px transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          New Knowledge Base
        </Link>
      </div>

      <div className="flex-1 p-8 px-9 overflow-y-auto">
        {/* Search + filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search knowledge bases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.88rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted"
            />
          </div>
          <div className="flex gap-2 items-center">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-[20px] text-[0.8rem] border transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-accent border-accent text-white"
                    : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : kbs.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            No knowledge bases found
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[18px]">
            {kbs.map((kb) => (
              <Link
                key={kb.id}
                href={`/knowledge-bases/${kb.id}`}
                className="bg-bg-surface border border-border rounded-[14px] p-6 cursor-pointer transition-all relative overflow-hidden group hover:border-border-hover hover:-translate-y-[3px] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-accent before:to-[#4834d4] before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[1.2rem]"
                    style={{ background: getGroupColor(kb.group.name) }}
                  >
                    {kb.group.emoji || kb.group.name.charAt(0)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all">
                      <MoreIcon className="w-[15px] h-[15px]" />
                    </button>
                  </div>
                </div>
                <h4 className="text-[1rem] font-semibold mb-1.5 leading-snug">{kb.title}</h4>
                <p className="text-[0.82rem] text-text-secondary leading-relaxed mb-[18px] line-clamp-2">
                  {kb.content.slice(0, 150)}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[0.6rem] font-semibold text-white"
                    style={{ background: getAvatarGradient(kb.owner.name) }}
                  >
                    {getInitials(kb.owner.name)}
                  </div>
                  <span className="text-[0.76rem] text-text-secondary">{kb.owner.name}</span>
                </div>
                <div className="flex items-center justify-between pt-3.5 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.72rem] px-2.5 py-1 rounded-[6px] bg-bg-surface-2 text-text-secondary">
                      {kb.group.emoji} {kb.group.name}
                    </span>
                    {kb.format && kb.format !== "text" && (
                      <span className="text-[0.68rem] px-2 py-0.5 rounded-[5px] bg-accent/10 text-accent font-medium uppercase">
                        {kb.format}
                      </span>
                    )}
                  </div>
                  <span className="text-[0.72rem] text-text-muted">
                    Updated {formatRelativeTime(kb.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
