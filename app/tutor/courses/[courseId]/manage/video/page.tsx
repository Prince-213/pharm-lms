import { Lightbulb, Video } from "lucide-react";
import { TutorialVideoPlayer } from "@/components/mentor/tutorial-video-player";
import { TUTORIAL_VIDEO_URL } from "@/lib/video-constants";

export default async function MentorCourseSetupVideoPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-6 pb-12">
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/80 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
              <Video className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Setup & test video
            </h1>
          </div>
        </div>

        <div className="px-8 py-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  Arrange your ideal studio and get early feedback
                </h2>
                <p className="leading-relaxed text-[var(--muted)]">
                  It&apos;s important to test your audio and video setup before
                  recording your actual course lessons. Proper planning ensures
                  your content looks professional and keeps students engaged.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--warning-star)]/25 bg-[var(--warning-star)]/10 p-8">
                <div className="mb-4 flex items-center gap-2 text-[var(--warning-star)]">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="text-base font-bold">Preparation Checklist</h3>
                </div>
                <ul className="grid grid-cols-1 gap-4 text-sm text-[var(--foreground)]">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning-star)]" />
                    <span>
                      <strong>Environment:</strong> Choose a quiet, well-lit
                      space with a clean background.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning-star)]" />
                    <span>
                      <strong>Lighting:</strong> Facing a window provides the
                      best natural light. If using lamps, ensure light is
                      balanced.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning-star)]" />
                    <span>
                      <strong>Audio:</strong> Minimize echo with soft
                      furnishings and use a lapel or condenser mic if possible.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning-star)]" />
                    <span>
                      <strong>framing:</strong> Keep the camera at eye level and
                      maintain good posture throughout.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Expert Tutorial
                  </p>
                  <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[var(--primary-strong)]">
                    Highly Recommended
                  </span>
                </div>
                <TutorialVideoPlayer url={TUTORIAL_VIDEO_URL} />
                <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs italic text-[var(--muted)] line-clamp-3">
                  Watch our Masterclass on setting up your home recording
                  studio. We cover everything from lighting to sound treatment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
