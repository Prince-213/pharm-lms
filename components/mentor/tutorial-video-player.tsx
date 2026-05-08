"use client";

import { Play } from "lucide-react";
import { useState } from "react";

interface TutorialVideoPlayerProps {
  url: string;
  thumbnail?: string;
}

export function TutorialVideoPlayer({ url }: TutorialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg border border-slate-200 bg-black">
        <video
          src={url}
          className="h-full w-full"
          controls
          autoPlay
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md transition-all hover:shadow-xl border border-slate-200 bg-slate-100"
      onClick={() => setIsPlaying(true)}
    >
      <div className="relative aspect-video w-full bg-slate-200 flex items-center justify-center">
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-current" />
          </div>
        </div>
        
        {/* Placeholder text if no real image */}
        <div className="text-center p-4">
          <p className="font-semibold text-slate-600">Watch Tutorial</p>
          <p className="text-xs text-slate-500 mt-1">Learn to create premium course videos</p>
        </div>
      </div>
    </div>
  );
}
