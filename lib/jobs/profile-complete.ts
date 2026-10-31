export function isStudentProfileComplete(user: {
  fullName?: string | null;
  country?: string | null;
  city?: string | null;
}): boolean {
  return (
    (user.fullName ?? "").trim().length >= 2 &&
    Boolean(user.country?.trim()) &&
    Boolean(user.city?.trim())
  );
}
