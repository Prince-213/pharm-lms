import {
  BookOpen,
  Calendar,
  Chalkboard,
  ChatCircle,
  Check,
  ClipboardText,
  Clock,
  FileText,
  GraduationCap,
  Handshake,
  Lightbulb,
  LinkedinLogo,
  Medal,
  Path,
  Presentation,
  ShieldCheck,
  UserPlus,
  Users,
  VideoCamera,
  Wallet,
} from "@phosphor-icons/react/ssr";
import type { ComponentType } from "react";
import type { AudienceIconName } from "@/lib/audience-landing-content";
import { cn } from "@/lib/utils";

type PhosphorIcon = ComponentType<{
  className?: string;
  weight?: "duotone" | "regular" | "bold";
}>;

const ICONS: Record<AudienceIconName, PhosphorIcon> = {
  book: BookOpen,
  users: Users,
  wallet: Wallet,
  calendar: Calendar,
  graduation: GraduationCap,
  shield: ShieldCheck,
  userPlus: UserPlus,
  presentation: Presentation,
  clipboard: ClipboardText,
  file: FileText,
  linkedin: LinkedinLogo,
  chat: ChatCircle,
  medal: Medal,
  check: Check,
  clock: Clock,
  lightbulb: Lightbulb,
  video: VideoCamera,
  handshake: Handshake,
  chalkboard: Chalkboard,
  path: Path,
};

export function AudienceIcon({
  name,
  className,
  weight = "duotone",
}: {
  name: AudienceIconName;
  className?: string;
  weight?: "duotone" | "regular" | "bold";
}) {
  const Glyph = ICONS[name];
  return <Glyph className={cn("size-6", className)} weight={weight} />;
}
