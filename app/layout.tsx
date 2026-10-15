import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import { SessionProvider } from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "HabitFlow - Modern Habit Tracker",
  description: "Build better habits, one day at a time.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo-light.svg",
        href: "/logo-lightsvg"
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased dark:bg-[#1F1F1F]`}
      >
        <TooltipProvider>
          <Toaster />
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange={false}
              storageKey="habitflow-theme"
            >
              {children}
            </ThemeProvider>
          </SessionProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
