import "./globals.css";
import { Toaster } from "sonner";
import { SessionProviderWrapper } from "@/components/session-provider-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";
import { rootMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", fontVariables)}>
      <body className="flex min-h-full flex-col font-sans">
        <TooltipProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </TooltipProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
