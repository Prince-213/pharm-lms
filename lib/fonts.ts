import { Montserrat, Outfit, Roboto_Mono } from "next/font/google";

/** Body text */
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/** Headings (`font-display`, h1–h6) */
export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = [
  montserrat.variable,
  outfit.variable,
  robotoMono.variable,
].join(" ");
