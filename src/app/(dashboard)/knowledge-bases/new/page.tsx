"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { useAuth } from "@/lib/auth-context";
import { knowledgeBases as kbApi, groups as groupsApi, ApiError } from "@/lib/api";

export default function KnowledgeBaseCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, userGroups } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allGroups, setAllGroups] = useState<{ id: string; name: string; emoji: string | null }[]>([]);

  useEffect(() => {
    if (isAdmin) {
      groupsApi
        .findAll({ limit: 100 })
        .then((res) => setAllGroups(res.data.map((g) => ({ id: g.id, name: g.name, emoji: g.emoji }))))
        .catch(() => {});
    }
  }, [isAdmin]);

  const selectGroups = isAdmin ? allGroups : userGroups;

  async function handleSubmit() {
    if (!title.trim() || !groupId || !content.trim()) return;
    setSubmitting(true);
    try {
      const kb = await kbApi.create({
        title: title.trim(),
        groupId,
        content: content.trim(),
      });
      showToast("Knowledge base created!");
      router.push(`/knowledge-bases/${kb.id}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to create", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-border bg-bg-deep/60 backdrop-blur-[12px] sticky top-0 z-10">
        <div>
          <h2 className="font-serif text-[1.3rem] font-medium">New Knowledge Base</h2>
          <p className="text-[0.82rem] text-text-secondary mt-0.5">
            Create a new knowledge base entry
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 px-9 overflow-y-auto">
        <div className="max-w-[820px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary mb-4">
            <Link href="/knowledge-bases" className="text-accent hover:underline">
              Knowledge Bases
            </Link>
            <span>{"\u203A"}</span>
            <span className="text-text-primary">New Knowledge Base</span>
          </div>

          <h2 className="font-serif text-[1.8rem] font-medium mb-8">Create Knowledge Base</h2>

          {/* Form */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Deployment Checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
              Group
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238b8a9e%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] pr-10 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all"
            >
              <option value="">Select a group...</option>
              {selectGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
              Content
            </label>
            <textarea
              placeholder={"Write your knowledge base content here...\n\nSupports plain text. You can structure with headings, lists, and code examples."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted min-h-[320px] resize-y leading-[1.7]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !groupId || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light hover:border-accent-light transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckIcon className="w-4 h-4" />
              {submitting ? "Creating..." : "Create"}
            </button>
            <Link
              href="/knowledge-bases"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 hover:border-border-hover transition-all"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
