"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { EditIcon, TrashIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { knowledgeBases as kbApi, ApiError } from "@/lib/api";
import type { KnowledgeBase } from "@/lib/types";
import { getInitials, getAvatarGradient, formatRelativeTime } from "@/lib/utils";

export default function KnowledgeBaseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const id = params.id as string;

  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    kbApi
      .findOne(id)
      .then(setKb)
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : "Failed to load", "error");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await kbApi.delete(id);
      showToast("Knowledge base deleted");
      router.push("/knowledge-bases");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to delete", "error");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kb) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        Knowledge base not found
      </div>
    );
  }

  return (
    <>
      {/* Topbar */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-border bg-bg-deep/60 backdrop-blur-[12px] sticky top-0 z-10">
        <div>
          <h2 className="font-serif text-[1.3rem] font-medium">Knowledge Base</h2>
          <p className="text-[0.82rem] text-text-secondary mt-0.5">Viewing document</p>
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
            <span>{kb.group.name}</span>
            <span>{"\u203A"}</span>
            <span className="text-text-primary">{kb.title}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-5 mb-8">
            <div>
              <h2 className="font-serif text-[1.8rem] font-medium leading-snug">{kb.title}</h2>
              <div className="flex items-center gap-4 mt-3 text-[0.8rem] text-text-secondary">
                <span className="flex items-center gap-1.5">
                  Created by{" "}
                  <span
                    className="inline-flex items-center justify-center w-[18px] h-[18px] rounded text-[0.55rem] font-semibold text-white"
                    style={{ background: getAvatarGradient(kb.owner.name) }}
                  >
                    {getInitials(kb.owner.name)}
                  </span>
                  <strong className="text-text-primary">{kb.owner.name}</strong>
                </span>
                <div className="w-[3px] h-[3px] rounded-full bg-text-muted" />
                <span>{kb.group.emoji} {kb.group.name}</span>
                <div className="w-[3px] h-[3px] rounded-full bg-text-muted" />
                <span>Updated {formatRelativeTime(kb.updatedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/knowledge-bases/${kb.id}/edit`}
                className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-[10px] text-[0.8rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 hover:border-border-hover hover:-translate-y-px transition-all"
              >
                <EditIcon className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-[10px] text-[0.8rem] font-medium border border-danger/20 text-danger hover:bg-danger/10 hover:border-danger/30 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-bg-surface border border-border rounded-[14px] p-9 leading-[1.8] text-[0.92rem] text-text-secondary whitespace-pre-wrap">
            {kb.content}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h3 className="font-serif text-[1.2rem] mb-5">Delete Knowledge Base</h3>
        <p className="text-text-secondary text-[0.9rem] leading-relaxed mb-6">
          Are you sure you want to delete <strong>&quot;{kb.title}&quot;</strong>? This action
          cannot be undone and all content will be permanently removed.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium border border-danger/20 text-danger hover:bg-danger/10 hover:border-danger/30 transition-all disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
