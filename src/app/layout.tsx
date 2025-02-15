import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeverCast",
  description: "Transform your ideas into engaging social media content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="flex h-screen">
              <SignedIn>
                <Sidebar />
              </SignedIn>
              <main className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto w-full min-w-[320px] max-w-[min(90vw,_640px)] md:max-w-[min(75%,_640px)] lg:max-w-[min(60%,_640px)]">
                  <SignedOut>
                    <div className="flex justify-center mt-8">
                      <SignInButton />
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex justify-end mb-4">
                      <UserButton afterSignOutUrl="/"/>
                    </div>
                    {children}
                  </SignedIn>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
