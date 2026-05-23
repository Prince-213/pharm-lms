import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProviderWrapper } from "@/components/session-provider-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";

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
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <TooltipProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
