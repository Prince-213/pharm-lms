import { Outfit, Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";

export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/** Geometric sans — pairs with Outfit; closest standard match to Satoshi. */
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = [
  outfit.variable,
  plusJakartaSans.variable,
  robotoMono.variable,
].join(" ");
