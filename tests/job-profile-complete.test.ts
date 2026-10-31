import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TITLE_KEEP_RE } from "../lib/jobs/constants.ts";
import { isStudentProfileComplete } from "../lib/jobs/profile-complete.ts";
import { type RankableJob, rankJobs } from "../lib/jobs/ranker.ts";

describe("isStudentProfileComplete", () => {
  it("requires name, country, and city", () => {
    assert.equal(
      isStudentProfileComplete({
        fullName: "Ada Lovelace",
        country: "Nigeria",
        city: "Lagos",
      }),
      true,
    );
    assert.equal(
      isStudentProfileComplete({
        fullName: "Ada",
        country: "Nigeria",
        city: "",
      }),
      false,
    );
  });
});

describe("rankJobs", () => {
  it("prefers title overlap and remote when requested", () => {
    const jobs: RankableJob[] = [
      {
        id: "1",
        title: "Retail cashier",
        snippet: "Store front",
        location: "London",
        remote: false,
        company: "Shop",
        source: "jobicy",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/a",
        postedAt: null,
      },
      {
        id: "2",
        title: "Pharmacovigilance analyst",
        snippet: "Drug safety remote",
        location: "Remote",
        remote: true,
        company: "Pharma",
        source: "themuse",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/b",
        postedAt: null,
      },
    ];
    const ranked = rankJobs(
      jobs,
      { roles: ["pharmacovigilance"], workStyle: "REMOTE" },
      2,
    );
    assert.equal(ranked[0]?.id, "2");
  });

  it("sorts by postedAt when Next cache serialized the Date", () => {
    const jobs: RankableJob[] = [
      {
        id: "old",
        title: "Pharmacovigilance analyst",
        snippet: null,
        location: "Remote",
        remote: true,
        company: "OldCo",
        source: "jobicy",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/old",
        postedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "new",
        title: "Pharmacovigilance analyst",
        snippet: null,
        location: "Remote",
        remote: true,
        company: "NewCo",
        source: "themuse",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/new",
        postedAt: "2026-10-01T00:00:00.000Z",
      },
    ];
    const ranked = rankJobs(
      jobs,
      { roles: ["pharmacovigilance"], workStyle: "REMOTE" },
      2,
    );
    assert.equal(ranked[0]?.id, "new");
  });

  it("drops zero-score jobs instead of filling by recency", () => {
    const jobs: RankableJob[] = [
      {
        id: "noise",
        title: "Retail cashier",
        snippet: "Introduction to Community Pharmacy Practice in Nigeria",
        location: "Nigeria",
        remote: true,
        company: "Shop",
        source: "jobicy",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/noise",
        postedAt: "2026-10-01T00:00:00.000Z",
      },
    ];
    const ranked = rankJobs(
      jobs,
      {
        roles: ["pharmacovigilance"],
        workStyle: "REMOTE",
        country: "Nigeria",
        extraKeywords: [
          "Introduction to Community Pharmacy Practice in Nigeria",
        ],
      },
      8,
    );
    assert.equal(ranked.length, 0);
  });

  it("ignores bio-token noise and still requires a role keyword on title", () => {
    const jobs: RankableJob[] = [
      {
        id: "generic",
        title: "Community manager",
        snippet: "Practice introduction for Nigeria",
        location: "Lagos",
        remote: false,
        company: "Acme",
        source: "themuse",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/generic",
        postedAt: null,
      },
      {
        id: "match",
        title: "Drug safety officer",
        snippet: null,
        location: "Remote",
        remote: true,
        company: "Pharma",
        source: "jobicy",
        type: "Full-time",
        salaryText: null,
        applyUrl: "https://example.com/match",
        postedAt: null,
      },
    ];
    const ranked = rankJobs(
      jobs,
      {
        roles: ["pharmacovigilance"],
        extraKeywords: [
          "Introduction to Community Pharmacy Practice in Nigeria",
        ],
      },
      8,
    );
    assert.deepEqual(
      ranked.map((job) => job.id),
      ["match"],
    );
  });
});

describe("TITLE_KEEP_RE", () => {
  it("keeps pharma titles and drops solar PV", () => {
    assert.match("Pharmacovigilance analyst", TITLE_KEEP_RE);
    assert.match("Life science data lead", TITLE_KEEP_RE);
    assert.doesNotMatch(
      "Projektentwickler BESS / Wind / PV (Deutschland)",
      TITLE_KEEP_RE,
    );
  });
});
