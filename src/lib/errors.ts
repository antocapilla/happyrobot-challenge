import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Log error for debugging (only in development or with proper logging service)
 */
function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[API Error]${context ? ` ${context}:` : ":"}`, error);
  }
  // In production, you'd use a proper logging service (e.g., Sentry, DataDog)
}

/**
 * Handle API errors and return appropriate response.
 * Follows REST API best practices with consistent error structure.
 */
export function handleApiError(error: unknown): NextResponse {
  // Validation errors (400)
  if (error instanceof ZodError) {
    logError(error, "Validation");
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    logError(error, `API Error ${error.statusCode}`);
    return NextResponse.json(
      {
        error: {
          code: error.code || `HTTP_${error.statusCode}`,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  // Generic errors (500) - don't expose internal details in production
  if (error instanceof Error) {
    logError(error, "Internal Server Error");
    const isDevelopment = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: isDevelopment
            ? error.message
            : "An internal server error occurred",
        },
      },
      { status: 500 }
    );
  }

  // Unknown errors
  logError(error, "Unknown Error");
  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}
