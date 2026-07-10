"use client";

import { Play } from "lucide-react";
import { useState } from "react";

interface TutorialVideoPlayerProps {
  url: string;
  thumbnail?: string;
}

function isEmbedUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)/i.test(url);
}

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

export function TutorialVideoPlayer({ url }: TutorialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-black shadow-lg">
        {isEmbedUrl(url) ? (
          <iframe
            src={toEmbedSrc(url)}
            title="Tutorial video"
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            className="h-full w-full"
            controls
            autoPlay
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-md transition-all hover:shadow-xl"
      onClick={() => setIsPlaying(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsPlaying(true);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Play tutorial video"
    >
      <div className="relative flex aspect-video w-full items-center justify-center bg-slate-200">
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-current" />
          </div>
        </div>

        <div className="p-4 text-center">
          <p className="font-semibold text-slate-600">Watch Tutorial</p>
          <p className="mt-1 text-xs text-slate-500">
            Learn to create premium course videos
          </p>
        </div>
      </div>
    </div>
  );
}
