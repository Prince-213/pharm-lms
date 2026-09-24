import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/pharm_logo.webp");
const seoDir = join(root, "public/seo");
const ogDir = join(root, "public/og");

mkdirSync(seoDir, { recursive: true });
mkdirSync(ogDir, { recursive: true });

async function markOnCanvas(
  size: number,
  background: { r: number; g: number; b: number; alpha: number },
  paddingRatio = 0.14,
) {
  const inner = Math.max(1, Math.round(size * (1 - paddingRatio * 2)));
  const mark = await sharp(logoPath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

function pngsToIco(
  images: { png: Buffer; width: number; height: number }[],
): Buffer {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const entries = images.map((img) => {
    const entry = {
      width: img.width >= 256 ? 0 : img.width,
      height: img.height >= 256 ? 0 : img.height,
      size: img.png.length,
      offset,
    };
    offset += img.png.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let pos = 6;
  for (const entry of entries) {
    buf.writeUInt8(entry.width, pos);
    buf.writeUInt8(entry.height, pos + 1);
    buf.writeUInt8(0, pos + 2);
    buf.writeUInt8(0, pos + 3);
    buf.writeUInt16LE(1, pos + 4);
    buf.writeUInt16LE(32, pos + 6);
    buf.writeUInt32LE(entry.size, pos + 8);
    buf.writeUInt32LE(entry.offset, pos + 12);
    pos += 16;
  }

  for (const img of images) {
    img.png.copy(buf, pos);
    pos += img.png.length;
  }

  return buf;
}

/** Resize an AI-authored source to the Open Graph 1200×630 JPEG. */
async function writeOgJpeg(sourceName: string, dest: string) {
  await sharp(join(root, "scripts/og-sources", sourceName))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toFile(dest);
}

async function main() {
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const appleBg = { r: 245, g: 247, b: 250, alpha: 255 };

  const fav16 = await markOnCanvas(16, transparent, 0.06);
  const fav32 = await markOnCanvas(32, transparent, 0.06);
  const fav48 = await markOnCanvas(48, transparent, 0.08);
  const apple = await markOnCanvas(180, appleBg, 0.16);
  const chrome192 = await markOnCanvas(192, appleBg, 0.14);
  const chrome512 = await markOnCanvas(512, appleBg, 0.14);

  writeFileSync(join(seoDir, "favicon-16x16.png"), fav16);
  writeFileSync(join(seoDir, "favicon-32x32.png"), fav32);
  writeFileSync(join(seoDir, "apple-touch-icon.png"), apple);
  writeFileSync(join(seoDir, "android-chrome-192x192.png"), chrome192);
  writeFileSync(join(seoDir, "android-chrome-512x512.png"), chrome512);

  const ico = pngsToIco([
    { png: fav16, width: 16, height: 16 },
    { png: fav32, width: 32, height: 32 },
    { png: fav48, width: 48, height: 48 },
  ]);
  writeFileSync(join(seoDir, "favicon.ico"), ico);
  writeFileSync(join(root, "public/favicon.ico"), ico);

  const homeOg = join(ogDir, "home-v3.jpg");
  const defaultOg = join(ogDir, "default-v3.jpg");
  await writeOgJpeg("home.png", homeOg);
  await writeOgJpeg("default.png", defaultOg);
  await writeOgJpeg("home.png", join(root, "app/opengraph-image.jpg"));
  await writeOgJpeg("default.png", join(root, "app/twitter-image.jpg"));

  console.log("Wrote favicons to public/seo and OG cards to public/og + app/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
