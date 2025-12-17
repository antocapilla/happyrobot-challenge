"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApiDocs = pathname === "/api-docs";

  useEffect(() => {
    if (isApiDocs) {
      // Enable scrolling for Swagger UI
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.height = "auto";
      document.body.style.height = "auto";
    } else {
      // Restore original styles for other pages
      document.body.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
      document.body.style.height = "100%";
    }

    return () => {
      // Cleanup if needed
    };
  }, [isApiDocs]);

  if (isApiDocs) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={false} className="h-svh">
      <AppSidebar />
      <SidebarInset className="h-full overflow-y-auto flex flex-col">{children}</SidebarInset>
    </SidebarProvider>
  );
}

