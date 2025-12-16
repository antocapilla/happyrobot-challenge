import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inbound Carrier Sales Dashboard",
  description: "HappyRobot Challenge - Inbound Carrier Sales Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}>
        <QueryProvider>
          <SidebarProvider defaultOpen={false} className="h-svh">
            <AppSidebar />
            <SidebarInset className="h-full overflow-y-auto flex flex-col">{children}</SidebarInset>
          </SidebarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
