"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading API documentation...</p>
      </div>
    </div>
  ),
});

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    // Suppress React strict mode warnings from swagger-ui-react
    // This is a known issue with swagger-ui-react using legacy React APIs
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("UNSAFE_componentWillReceiveProps") ||
          args[0].includes("componentWillReceiveProps") ||
          args[0].includes("ModelCollapse"))
      ) {
        return; // Suppress swagger-ui-react legacy warnings
      }
      originalError.call(console, ...args);
    };

    fetch("/api/openapi.json")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => {
        originalError.call(console, "Failed to load OpenAPI spec:", err);
      });

    return () => {
      console.error = originalError;
    };
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API specification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <SwaggerUI spec={spec} />
    </div>
  );
}

