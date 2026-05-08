import { TutorialVideoPlayer } from "@/components/mentor/tutorial-video-player";
import { TUTORIAL_VIDEO_URL } from "@/lib/video-constants";
import { Lightbulb, Video } from "lucide-react";

export default async function MentorCourseSetupVideoPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-6 pb-12">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-sm">
              <Video className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Setup & test video</h1>
          </div>
        </div>
        
        <div className="px-8 py-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Arrange your ideal studio and get early feedback
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  It&apos;s important to test your audio and video setup before recording your actual course lessons. 
                  Proper planning ensures your content looks professional and keeps students engaged.
                </p>
              </div>
              
              <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-8">
                <div className="flex items-center gap-2 mb-4 text-amber-700">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="text-base font-bold">Preparation Checklist</h3>
                </div>
                <ul className="grid grid-cols-1 gap-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span><strong>Environment:</strong> Choose a quiet, well-lit space with a clean background.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span><strong>Lighting:</strong> Facing a window provides the best natural light. If using lamps, ensure light is balanced.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span><strong>Audio:</strong> Minimize echo with soft furnishings and use a lapel or condenser mic if possible.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span><strong>framing:</strong> Keep the camera at eye level and maintain good posture throughout.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Expert Tutorial</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">Highly Recommended</span>
                </div>
                <TutorialVideoPlayer url={TUTORIAL_VIDEO_URL} />
                <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100 italic text-xs text-slate-500 line-clamp-3">
                  Watch our Masterclass on setting up your home recording studio. We cover everything from lighting to sound treatment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
