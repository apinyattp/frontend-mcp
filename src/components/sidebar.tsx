"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoIcon, UsersIcon, BookIcon, PlusCircleIcon, SignOutIcon } from "./icons";
import { useAuth } from "@/lib/auth-context";
import { getInitials, getAvatarGradient } from "@/lib/utils";

const navItems = [
  { href: "/groups", label: "Members & Groups", icon: UsersIcon },
  { href: "/knowledge-bases", label: "Knowledge Bases", icon: BookIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const name = user?.name ?? "User";
  const role = user?.role ?? "USER";

  return (
    <aside className="w-[260px] bg-bg-surface border-r border-border flex flex-col py-6 shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 mb-9">
        <div className="w-[38px] h-[38px] bg-gradient-to-br from-accent to-[#4834d4] rounded-xl flex items-center justify-center shadow-[0_4px_16px_var(--color-accent-glow)]">
          <LogoIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-serif text-[1.15rem] font-medium">KnowledgeHub</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        <div className="text-[0.7rem] uppercase tracking-[0.1em] text-text-muted px-3 pt-5 pb-2 font-semibold">
          Main
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] text-[0.88rem] transition-all duration-250 relative ${
                isActive
                  ? "bg-accent-glow text-text-primary"
                  : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r" />
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="text-[0.7rem] uppercase tracking-[0.1em] text-text-muted px-3 pt-5 pb-2 font-semibold">
          Quick Actions
        </div>
        <Link
          href="/knowledge-bases/new"
          className="flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] text-[0.88rem] text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-all duration-250"
        >
          <PlusCircleIcon className="w-[18px] h-[18px] shrink-0" />
          New Knowledge Base
        </Link>
      </nav>

      {/* User */}
      <div className="px-5 pt-4 border-t border-border flex items-center gap-3 mt-auto">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center font-semibold text-[0.82rem] text-white"
          style={{ background: getAvatarGradient(name) }}
        >
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.85rem] font-medium truncate">{name}</div>
          <div className="text-[0.72rem] text-accent-light font-medium uppercase tracking-[0.05em]">
            {role}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all cursor-pointer"
          title="Sign out"
        >
          <SignOutIcon className="w-[15px] h-[15px]" />
        </button>
      </div>
    </aside>
  );
}
