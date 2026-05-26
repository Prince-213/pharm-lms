"use client";

import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Returns true for YouTube/Vimeo URLs that need an `<iframe>` embed; false for
 * direct file URLs (mp4/webm/mov) that play in a `<video>` tag.
 */
function isEmbedUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)/i.test(url);
}

/** Normalizes a YouTube/Vimeo URL into an embeddable form with autoplay. */
function toEmbedSrc(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) {
        u.searchParams.set("autoplay", "1");
        u.searchParams.set("rel", "0");
        return u.toString();
      }
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host.endsWith("vimeo.com")) {
      if (u.pathname.startsWith("/video/") || host === "player.vimeo.com") {
        u.searchParams.set("autoplay", "1");
        return u.toString();
      }
      const id = u.pathname.replace(/^\//, "");
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  } catch {
    return url;
  }
}

export function WatchDemoButton({
  label,
  videoUrl,
  className,
}: {
  label: string;
  videoUrl?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!videoUrl}
        className={
          className ??
          "inline-flex z-20 relative items-center gap-2 lg:rounded-lg rounded-[8px] bg-emerald-50 lg:px-[28px] px-[20px] lg:py-4.5 py-4 text-[18px] lg:text-sm text-xs font-semibold text-[var(--emerald)] shadow-xl shadow-gray-300/40 transition active:scale-95 disabled:opacity-60"
        }
        aria-haspopup="dialog"
      >
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--emerald)] text-white shadow-sm"
        >
          <Play className="h-3 w-3 fill-current" />
        </span>
        {label}
      </button>

      {open && videoUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Watch demo"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close demo video"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
          />

          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative z-[1] flex h-full w-full items-center justify-center p-0 sm:p-6">
            {isEmbedUrl(videoUrl) ? (
              <iframe
                src={toEmbedSrc(videoUrl)}
                title="Demo video"
                className="h-full w-full border-0 sm:rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                className="h-full w-full bg-black object-contain sm:rounded-lg"
                controls
                autoPlay
                playsInline
              >
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
