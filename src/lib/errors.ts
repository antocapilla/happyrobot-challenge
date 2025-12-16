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
 * Handle API errors and return appropriate response.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: true,
        error_message: "Validation error",
        errors: error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: true,
        error_message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: true,
        error_message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: true,
      error_message: "Unknown error occurred",
    },
    { status: 500 }
  );
}
