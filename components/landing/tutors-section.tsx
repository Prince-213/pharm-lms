import { getLandingContent, type LandingAudience } from "@/lib/landing-content";
import { loadLandingTutors } from "@/lib/landing/load-landing-data";
import { LandingPeopleSection } from "./landing-people-section";

type TutorsSectionProps = {
  audience?: LandingAudience;
};

export async function TutorsSection({ audience = "student" }: TutorsSectionProps) {
  const { people } = getLandingContent(audience);
  const tutors = await loadLandingTutors(4);

  return (
    <LandingPeopleSection
      eyebrow={people.eyebrow}
      title={people.title}
      description={people.description}
      people={tutors}
    />
  );
}
