"use client";

import { Trophy, Flame, Award, BrainCircuit } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";

interface LeaderboardUserCardProps {
  user: LeaderboardEntry | null;
}

export function LeaderboardUserCard({ user }: LeaderboardUserCardProps) {
  if (!user) return null;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <UserAvatar
          src={user.avatarUrl}
          name={user.fullName}
          className="h-20 w-20 rounded-2xl border-4 border-indigo-50 shadow-lg"
          fallbackClassName="bg-indigo-100 text-2xl text-indigo-600"
        />
        
        <h3 className="mt-4 text-xl font-bold text-slate-900">{user.fullName} (You)</h3>
        <p className="text-sm font-medium text-slate-400">Pharm Student</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {/* Ranking */}
        <div className="rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{user.rank === 1 ? "1st" : user.rank === 2 ? "2nd" : user.rank === 3 ? "3rd" : `${user.rank}th`}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ranking</p>
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl bg-orange-50/50 p-4 ring-1 ring-orange-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
            <Award className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-orange-900">{user.badges}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Badges</p>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl bg-rose-50/50 p-4 ring-1 ring-rose-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
            <Flame className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-900">{user.streak}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Streak</p>
          </div>
        </div>

        {/* Quiz Points */}
        <div className="rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{user.quizPoints}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quiz pts</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <h4 className="text-sm font-bold text-slate-900">Summary</h4>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Total Lessons</p>
          <p className="font-bold text-slate-900">{user.lessons}</p>
        </div>
        <div className="mt-2 flex items-center justify-between font-bold">
          <p className="text-sm text-slate-900">Overall Points</p>
          <p className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">{user.points.toLocaleString()} PTS</p>
        </div>
      </div>
    </div>
  );
}
