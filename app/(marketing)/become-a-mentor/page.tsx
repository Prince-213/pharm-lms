import type { Metadata } from "next";
import { AudienceLanding } from "@/components/landing/audience-landing";
import { mentorPageContent } from "@/lib/audience-landing-content";

export const metadata: Metadata = {
  title: "Mentor",
  description:
    "Guide pharmacy students and professionals on PharmEdge. Offer mentorship sessions, career guidance, and flexible 1:1 support across Africa.",
  alternates: { canonical: "/become-a-mentor" },
};

export default function BecomeAMentorPage() {
  return <AudienceLanding content={mentorPageContent} />;
}
