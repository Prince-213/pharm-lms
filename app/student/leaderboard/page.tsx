import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { roleHomePath } from "@/lib/rbac";
import { getLeaderboardData } from "@/lib/student/leaderboard";
import { LeaderboardBanner } from "@/components/student/leaderboard-banner";
import { LeaderboardTable } from "@/components/student/leaderboard-table";
import { LeaderboardUserCard } from "@/components/student/leaderboard-user-card";

export const metadata = {
  title: "Leaderboard | Pharm LMS",
};

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/leaderboard");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const { entries, currentUser } = await getLeaderboardData(session.user.id);

  return (
    <div className="space-y-8 pb-12">
      <LeaderboardBanner />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Leaderboard List */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Rankings</h2>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
              <button className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">Global</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">This Month</button>
            </div>
          </div>
          <LeaderboardTable entries={entries} />
        </div>

        {/* User Sidebar Stats */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Your Stats</h2>
          <LeaderboardUserCard user={currentUser} />
          
          <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-lg overflow-hidden relative group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="relative z-10">
              <h4 className="text-xl font-bold">Earn points!</h4>
              <p className="mt-2 text-indigo-100 text-sm">
                Complete lessons and maintain your streak to climb the ranks.
              </p>
              <button className="mt-6 rounded-xl bg-white/20 px-6 py-2.5 text-sm font-bold backdrop-blur-md transition hover:bg-white/30">
                Start Learning
              </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
