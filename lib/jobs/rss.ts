export type RssItem = {
  title: string;
  link: string;
  description: string | null;
  pubDate: string | null;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function tag(block: string, name: string): string | null {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  if (!match?.[1]) return null;
  const text = decodeXml(match[1]);
  return text || null;
}

export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match = itemRe.exec(xml);
  while (match) {
    const block = match[1] ?? "";
    const title = tag(block, "title");
    const link = tag(block, "link") ?? tag(block, "guid");
    if (title && link) {
      items.push({
        title,
        link,
        description: tag(block, "description"),
        pubDate: tag(block, "pubDate") ?? tag(block, "dc:date"),
      });
    }
    match = itemRe.exec(xml);
  }
  return items;
}
