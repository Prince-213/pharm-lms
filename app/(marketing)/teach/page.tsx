import type { Metadata } from "next";
import { AudienceLanding } from "@/components/landing/audience-landing";
import { teachPageContent } from "@/lib/audience-landing-content";

export const metadata: Metadata = {
  title: "Teach",
  description:
    "Publish pharmacy courses on PharmEdge. Reach practitioners across Africa with a professional course builder, curriculum tools, and a dedicated tutor dashboard.",
  alternates: { canonical: "/teach" },
};

export default function TeachPage() {
  return <AudienceLanding content={teachPageContent} />;
}
