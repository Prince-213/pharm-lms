/**
 * Title font for headings (`font-display`). Body text always uses Outfit.
 *
 * - `"plus-jakarta"` — default; closest Google Fonts match to Satoshi
 * - `"satoshi"` — add variable files to `public/fonts/satoshi/` (see README in that folder)
 */
export type TitleFont = "plus-jakarta" | "satoshi";

export const TITLE_FONT: TitleFont = "plus-jakarta";
