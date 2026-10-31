import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRssItems } from "../lib/jobs/rss.ts";

describe("parseRssItems", () => {
  it("reads title, link, and CDATA description", () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Acme: Clinical data analyst</title>
          <link>https://weworkremotely.com/remote-jobs/acme-cda</link>
          <description><![CDATA[<p>Work on healthcare data</p>]]></description>
          <pubDate>Fri, 31 Oct 2026 00:00:00 +0000</pubDate>
        </item>
      </channel></rss>`;
    const items = parseRssItems(xml);
    assert.equal(items.length, 1);
    assert.equal(items[0]?.title, "Acme: Clinical data analyst");
    assert.equal(
      items[0]?.link,
      "https://weworkremotely.com/remote-jobs/acme-cda",
    );
    assert.match(items[0]?.description ?? "", /healthcare data/);
  });
});
