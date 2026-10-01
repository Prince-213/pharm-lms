import localFont from "next/font/local";

/** Body text */
export const montserrat = localFont({
  src: "../app/fonts/montserrat-latin-wght.woff2",
  variable: "--font-montserrat",
  display: "swap",
  weight: "100 900",
  preload: true,
});

/** Headings (`font-display`, `font-heading`, h1–h6) */
export const outfit = localFont({
  src: "../app/fonts/outfit-latin-wght.woff2",
  variable: "--font-outfit",
  display: "swap",
  weight: "100 900",
  preload: true,
});

export const robotoMono = localFont({
  src: "../app/fonts/roboto-mono-latin-wght.woff2",
  variable: "--font-roboto-mono",
  display: "swap",
  weight: "100 700",
});

export const fontVariables = [
  montserrat.variable,
  outfit.variable,
  robotoMono.variable,
].join(" ");
