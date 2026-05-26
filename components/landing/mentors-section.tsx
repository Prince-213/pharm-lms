import { loadLandingMentors } from "@/lib/landing/load-landing-data";
import { LandingPeopleSection } from "./landing-people-section";

export async function MentorsSection() {
  const mentors = await loadLandingMentors(4);

  return (
    <LandingPeopleSection
      eyebrow="Mentors"
      title="Guidance from practicing pharmacists"
      description="Book 1-on-1 coaching with approved mentors—residency prep, career transitions, and clinical decision-making."
      people={mentors}
      profileCta="View mentor"
    />
  );
}
