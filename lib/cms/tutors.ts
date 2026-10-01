import tutorsCms from "@/data/cms/tutors.json";

export type CmsTutor = {
  id: string;
  name: string;
  image: string;
  title?: string;
  bio?: string;
  objectPosition?: string;
};

export type LeadingProfessionalsCms = {
  highlight: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TutorsCms = {
  leadingProfessionals: LeadingProfessionalsCms;
  tutors: CmsTutor[];
};

export function getTutorsCms(): TutorsCms {
  return tutorsCms;
}

export function getCmsTutors(): CmsTutor[] {
  return tutorsCms.tutors;
}

/** Public path for a tutor photo (`/tutors/Name.png`). */
export function cmsTutorImageSrc(image: string): string {
  return image;
}
