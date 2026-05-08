import type { Metadata } from "next";
import { Inter, Manrope, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProviderWrapper } from "@/components/session-provider-wrapper";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pharm LMS",
  description: "Pharmacy LMS for mentors, students, and admins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${manrope.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
