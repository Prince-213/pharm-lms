"use client";

import { BookOpen, Play, X } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export function CatalogPreviewMedia({
  thumb,
  promoVideoHref,
  overlayLabel = "Preview this course",
}: {
  thumb: string | null;
  promoVideoHref: string | null;
  overlayLabel?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const hasPromo = Boolean(promoVideoHref);

  const onActivate = useCallback(() => {
    if (hasPromo) setPlaying(true);
  }, [hasPromo]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasPromo) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPlaying(true);
      }
    },
    [hasPromo],
  );

  return (
    <div className="relative aspect-video bg-[#2d2f31]">
      {playing && promoVideoHref ? (
        <div className="relative h-full w-full bg-black">
          {/* biome-ignore lint/a11y/useMediaCaption: Mentor-uploaded promo reel; captions not modeled in schema. */}
          <video
            src={promoVideoHref}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          {thumb ? (
            // biome-ignore lint/performance/noImgElement: Signed R2 or external URLs.
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#2d2f31]">
              <BookOpen className="h-14 w-14 text-white/25" />
            </div>
          )}
          <button
            type="button"
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center border-0 bg-black/40 p-0",
              hasPromo
                ? "cursor-pointer transition-colors hover:bg-black/50"
                : "cursor-default",
            )}
            onClick={onActivate}
            onKeyDown={onKeyDown}
            disabled={!hasPromo}
            aria-label={
              hasPromo ? "Play promotional video" : "Course preview image"
            }
          >
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white shadow-lg">
              <Play
                className="ml-1 h-10 w-10 text-[#2d2f31]"
                fill="currentColor"
                aria-hidden
              />
            </div>
            <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-base font-bold text-white drop-shadow-md">
              {overlayLabel}
            </p>
          </button>
        </>
      )}
    </div>
  );
}
