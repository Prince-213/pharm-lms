export const JOB_SOURCES = [
  "remoteok",
  "jobicy",
  "arbeitnow",
  "themuse",
  "himalayas",
  "fourdayweek",
  "jobremotely",
  "remotejobsorg",
  "apify",
] as const;

export type JobSourceId = (typeof JOB_SOURCES)[number];

export const JOB_SOURCE_LABELS: Record<JobSourceId, string> = {
  remoteok: "RemoteOK",
  jobicy: "Jobicy",
  arbeitnow: "Arbeitnow",
  themuse: "The Muse",
  himalayas: "Himalayas",
  fourdayweek: "4 Day Week",
  jobremotely: "JobRemotely",
  remotejobsorg: "RemoteJobs.org",
  apify: "Apify",
};

export const JOB_SOURCE_HOME: Record<JobSourceId, string> = {
  remoteok: "https://remoteok.com",
  jobicy: "https://jobicy.com",
  arbeitnow: "https://www.arbeitnow.com",
  themuse: "https://www.themuse.com",
  himalayas: "https://himalayas.app",
  fourdayweek: "https://4dayweek.io",
  jobremotely: "https://jobremotely.io",
  remotejobsorg: "https://remotejobs.org",
  apify: "https://apify.com",
};

export const ROLE_OPTIONS = [
  { id: "clinical-data", label: "Clinical data analyst" },
  { id: "pharmacovigilance", label: "Pharmacovigilance analyst" },
  { id: "informatics", label: "Health informatics specialist" },
  { id: "digital-health", label: "Digital health strategist" },
  { id: "community-hospital", label: "Community / hospital pharmacist" },
] as const;

export const ROLE_KEYWORDS: Record<string, string[]> = {
  "clinical-data": [
    "clinical data",
    "biostat",
    "clinical analyst",
    "health data",
  ],
  pharmacovigilance: ["pharmacovigilance", "drug safety", "vigilance"],
  informatics: ["informatic", "fhir", "hl7", "ehr", "health it"],
  "digital-health": ["digital health", "healthtech", "telehealth", "e-health"],
  "community-hospital": ["pharmacist", "pharmacy", "dispens"],
};

export const DEFAULT_PATHWAY_ROLES = [
  "clinical-data",
  "pharmacovigilance",
  "informatics",
  "digital-health",
] as const;

export const TITLE_KEEP_RE =
  /pharmac|vigilance|clinical data|informatic|digital health|healthcare data|pharmacy|pharmacist|medical affairs|drug safety|health data|clinical analyst|life science/i;

export const USER_AGENT =
  "PharmEdgeJobAlerts/1.0 (+https://edge.pharmanalytics.org)";

export const JOB_TTL_DAYS = 21;
export const LISTING_CAP = 24;
export const DEFAULT_EMAIL_JOBS = 5;
export const APIFY_MAX_ITEMS = 40;
export const APIFY_MAX_CHARGE_USD = 0.5;
export const APIFY_DEFAULT_ACTOR = "agentx~all-jobs-scraper";
/** ATS boards only — never LinkedIn or Indeed (ToS + they burn the $5). */
export const APIFY_PLATFORMS = ["Greenhouse", "Lever", "Ashby"] as const;

export function isApifyConfigured() {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}

export function isJobsBoardLive() {
  const raw = process.env.JOBS_BOARD_LIVE?.trim();
  if (raw === "0" || raw === "false") return false;
  return raw === "1" || raw === "true";
}
