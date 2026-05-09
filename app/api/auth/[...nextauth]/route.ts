import { handlers } from "@/auth";
import { getAuthSecret } from "@/lib/auth/secret";

if (process.env.NODE_ENV === "production" && !getAuthSecret()) {
  console.error(
    "[auth] Missing AUTH_SECRET / NEXTAUTH_SECRET in this runtime. On Netlify, scope the variable for Functions (not only Builds).",
  );
}

export const { GET, POST } = handlers;
