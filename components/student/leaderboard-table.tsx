"use client";

import { Crown, Medal } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "group relative flex items-center justify-between rounded-2xl bg-white p-4 transition-all hover:shadow-md",
            entry.isCurrentUser
              ? "ring-2 ring-indigo-500 bg-indigo-50/10"
              : "border border-slate-100"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Rank Indicator */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center font-bold text-slate-400">
              {entry.rank === 1 ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm ring-1 ring-amber-200">
                  <Crown className="h-6 w-6" />
                </div>
              ) : entry.rank === 2 ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Medal className="h-6 w-6" />
                </div>
              ) : entry.rank === 3 ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-sm ring-1 ring-orange-200">
                  <Medal className="h-6 w-6" />
                </div>
              ) : (
                <span className="text-lg">{entry.rank}</span>
              )}
            </div>

            {/* Avatar & Name */}
            <UserAvatar
              src={entry.avatarUrl}
              name={entry.fullName}
              className="h-12 w-12 rounded-xl border border-slate-100 shadow-sm"
              fallbackClassName="bg-indigo-100 text-indigo-600"
            />

            <div className="min-w-0">
              <h4 className="truncate font-bold text-slate-900">
                {entry.fullName}
                {entry.isCurrentUser && (
                  <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    You
                  </span>
                )}
              </h4>
              <p className="text-xs font-medium text-slate-400">Pharm Student</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 shadow-inner group-hover:bg-white transition-colors">
              {entry.points.toLocaleString()} <span className="text-slate-400 font-medium">Pts</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
