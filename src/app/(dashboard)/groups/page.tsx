"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, EditIcon, XIcon, UserPlusIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { useAuth } from "@/lib/auth-context";
import { groups as groupsApi, stats as statsApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { Group, GroupMember, Stats, Role } from "@/lib/types";
import { getInitials, getAvatarGradient, getGroupColor, formatRelativeTime } from "@/lib/utils";

export default function GroupsPage() {
  const { user, userGroups } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";

  // Data
  const [groupList, setGroupList] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [statData, setStatData] = useState<Stats | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Loading states
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Form state — create group
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("");
  const [submittingGroup, setSubmittingGroup] = useState(false);

  // Form state — assign member
  const [memberEmail, setMemberEmail] = useState("");
  const [submittingMember, setSubmittingMember] = useState(false);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      if (isAdmin) {
        const [res, st] = await Promise.all([
          groupsApi.findAll({ limit: 100 }),
          statsApi.get(),
        ]);
        setGroupList(res.data);
        setStatData(st);
        if (!selectedGroupId && res.data.length > 0) {
          setSelectedGroupId(res.data[0].id);
        }
      } else {
        // USER: show only their groups
        const mine = userGroups.map((ug) => ({
          id: ug.id,
          name: ug.name,
          emoji: ug.emoji,
          createdAt: "",
          updatedAt: "",
        }));
        setGroupList(mine);
        if (!selectedGroupId && mine.length > 0) {
          setSelectedGroupId(mine[0].id);
        }
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load groups", "error");
    } finally {
      setLoadingGroups(false);
    }
  }, [isAdmin, userGroups, selectedGroupId, showToast]);

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch members when selected group changes
  const fetchMembers = useCallback(async (gId: string) => {
    setLoadingMembers(true);
    try {
      const res = await groupsApi.getMembers(gId);
      setMembers(res.data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load members", "error");
    } finally {
      setLoadingMembers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedGroupId) fetchMembers(selectedGroupId);
  }, [selectedGroupId, fetchMembers]);

  const selectedGroup = groupList.find((g) => g.id === selectedGroupId);

  // Handlers
  async function handleCreateGroup() {
    if (!groupName.trim()) return;
    setSubmittingGroup(true);
    try {
      const newGroup = await groupsApi.create({
        name: groupName.trim(),
        emoji: groupEmoji || undefined,
      });
      showToast("Group created!");
      setShowGroupModal(false);
      setGroupName("");
      setGroupEmoji("");
      setGroupList((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to create group", "error");
    } finally {
      setSubmittingGroup(false);
    }
  }

  async function handleAssignMember() {
    if (!memberEmail.trim() || !selectedGroupId) return;
    setSubmittingMember(true);
    try {
      await groupsApi.addMember(selectedGroupId, {
        email: memberEmail.trim(),
      });
      showToast("User assigned!");
      setShowMemberModal(false);
      setMemberEmail("");
      fetchMembers(selectedGroupId);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to assign member", "error");
    } finally {
      setSubmittingMember(false);
    }
  }

  async function handleToggleRole(member: GroupMember) {
    if (!selectedGroupId) return;
    const newRole: Role = member.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await groupsApi.updateMemberRole(selectedGroupId, member.userId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.userId === member.userId ? { ...m, role: newRole } : m)),
      );
      showToast(`Role updated to ${newRole}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update role", "error");
    }
  }

  async function handleRemoveMember(member: GroupMember) {
    if (!selectedGroupId) return;
    try {
      await groupsApi.removeMember(selectedGroupId, member.userId);
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      showToast("Member removed");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to remove member", "error");
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-border bg-bg-deep/60 backdrop-blur-[12px] sticky top-0 z-10">
        <div>
          <h2 className="font-serif text-[1.3rem] font-medium">Members & Groups</h2>
          <p className="text-[0.82rem] text-text-secondary mt-0.5">
            Manage your organization&apos;s teams and memberships
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowGroupModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light hover:border-accent-light hover:shadow-[0_4px_20px_var(--color-accent-glow)] hover:-translate-y-px transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            New Group
          </button>
        )}
      </div>

      <div className="flex-1 p-8 px-9 overflow-y-auto">
        {/* Stats (admin only) */}
        {isAdmin && statData && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
            <div className="bg-bg-surface border border-border rounded-[14px] p-5 hover:border-border-hover hover:-translate-y-0.5 transition-all">
              <div className="text-[0.78rem] text-text-secondary mb-2 uppercase tracking-[0.05em]">Total Groups</div>
              <div className="font-serif text-[1.8rem] font-medium">{statData.totalGroups}</div>
              <div className="text-[0.78rem] text-success mt-1">+{statData.newGroupsThisMonth} this month</div>
            </div>
            <div className="bg-bg-surface border border-border rounded-[14px] p-5 hover:border-border-hover hover:-translate-y-0.5 transition-all">
              <div className="text-[0.78rem] text-text-secondary mb-2 uppercase tracking-[0.05em]">Total Members</div>
              <div className="font-serif text-[1.8rem] font-medium">{statData.totalMembers}</div>
              <div className="text-[0.78rem] text-success mt-1">+{statData.newMembersThisMonth} this month</div>
            </div>
            <div className="bg-bg-surface border border-border rounded-[14px] p-5 hover:border-border-hover hover:-translate-y-0.5 transition-all">
              <div className="text-[0.78rem] text-text-secondary mb-2 uppercase tracking-[0.05em]">Knowledge Bases</div>
              <div className="font-serif text-[1.8rem] font-medium">{statData.totalKnowledgeBases}</div>
              <div className="text-[0.78rem] text-success mt-1">Across all groups</div>
            </div>
          </div>
        )}

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {/* Groups panel */}
          <div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-border">
              <h3 className="text-[0.95rem] font-semibold">Groups</h3>
              {isAdmin && (
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-[10px] text-[0.8rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 hover:border-border-hover transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>
            <div className="p-2 max-h-[460px] overflow-y-auto">
              {loadingGroups ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : groupList.length === 0 ? (
                <div className="text-center py-10 text-text-secondary text-[0.85rem]">
                  No groups found
                </div>
              ) : (
                groupList.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-[10px] cursor-pointer transition-all ${
                      group.id === selectedGroupId ? "bg-accent-glow" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[1.1rem] shrink-0"
                      style={{ background: getGroupColor(group.name) }}
                    >
                      {group.emoji || group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.88rem] font-medium mb-0.5">{group.name}</div>
                      {group.createdAt && (
                        <div className="text-[0.76rem] text-text-secondary">
                          Created {formatRelativeTime(group.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members panel */}
          <div className="bg-bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-border">
              <h3 className="text-[0.95rem] font-semibold">
                {selectedGroup ? `${selectedGroup.name} — Members` : "Members"}
              </h3>
              {isAdmin && selectedGroupId && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-[7px] rounded-[10px] text-[0.8rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light hover:border-accent-light transition-all"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  Assign User
                </button>
              )}
            </div>
            <div className="p-2 max-h-[460px] overflow-y-auto">
              {loadingMembers ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-10 text-text-secondary text-[0.85rem]">
                  No members in this group
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 px-4 py-3 rounded-[10px] group hover:bg-white/[0.03] transition-all"
                  >
                    <div
                      className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[0.75rem] font-semibold text-white shrink-0"
                      style={{ background: getAvatarGradient(member.name) }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.85rem] font-medium">{member.name}</div>
                      <div className="text-[0.75rem] text-text-secondary">{member.email}</div>
                    </div>
                    <span
                      className={`text-[0.68rem] font-semibold px-2.5 py-[3px] rounded-lg uppercase tracking-[0.05em] ${
                        member.role === "ADMIN"
                          ? "bg-accent/15 text-accent-light"
                          : "bg-success/12 text-success"
                      }`}
                    >
                      {member.role}
                    </span>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleRole(member)}
                          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all"
                          title={`Switch to ${member.role === "ADMIN" ? "User" : "Admin"}`}
                        >
                          <EditIcon className="w-[15px] h-[15px]" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all"
                          title="Remove member"
                        >
                          <XIcon className="w-[15px] h-[15px]" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <Modal open={showGroupModal} onClose={() => setShowGroupModal(false)}>
        <h3 className="font-serif text-[1.2rem] mb-5">Create New Group</h3>
        <div className="mb-6">
          <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. Backend Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="mb-7">
          <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
            Emoji Icon
          </label>
          <input
            type="text"
            placeholder="e.g. 🚀"
            value={groupEmoji}
            onChange={(e) => setGroupEmoji(e.target.value)}
            maxLength={2}
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={() => setShowGroupModal(false)}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={submittingGroup || !groupName.trim()}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submittingGroup ? "Creating..." : "Create Group"}
          </button>
        </div>
      </Modal>

      {/* Assign Member Modal */}
      <Modal open={showMemberModal} onClose={() => setShowMemberModal(false)}>
        <h3 className="font-serif text-[1.2rem] mb-5">Assign User to Group</h3>
        <div className="mb-6">
          <label className="block text-[0.82rem] font-medium text-text-secondary mb-2 uppercase tracking-[0.04em]">
            User Email
          </label>
          <input
            type="email"
            placeholder="user@company.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-[10px] text-[0.9rem] text-text-primary outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-2.5 justify-end mt-7">
          <button
            onClick={() => setShowMemberModal(false)}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium border border-border bg-bg-surface text-text-primary hover:bg-bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignMember}
            disabled={submittingMember || !memberEmail.trim()}
            className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-medium bg-accent border border-accent text-white hover:bg-accent-light transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submittingMember ? "Assigning..." : "Assign"}
          </button>
        </div>
      </Modal>
    </>
  );
}
