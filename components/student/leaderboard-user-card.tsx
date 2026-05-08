"use client";

import { Trophy, Flame, Award, BrainCircuit } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/student/leaderboard";

interface LeaderboardUserCardProps {
  user: LeaderboardEntry | null;
}

export function LeaderboardUserCard({ user }: LeaderboardUserCardProps) {
  if (!user) return null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-indigo-50 bg-indigo-100 shadow-lg">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-indigo-600 text-2xl">
              {user.fullName.charAt(0)}
            </div>
          )}
        </div>
        
        <h3 className="mt-4 text-xl font-bold text-slate-900">{user.fullName} (You)</h3>
        <p className="text-sm font-medium text-slate-400">Pharm Student</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {/* Ranking */}
        <div className="rounded-2xl bg-indigo-50/50 p-4 ring-1 ring-indigo-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
            <Trophy className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-indigo-900">{user.rank === 1 ? "1st" : user.rank === 2 ? "2nd" : user.rank === 3 ? "3rd" : `${user.rank}th`}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Ranking</p>
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
        <div className="rounded-2xl bg-emerald-50/50 p-4 ring-1 ring-emerald-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
            <BrainCircuit className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-900">{user.quizPoints}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Quiz pts</p>
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
