import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error",
        details: error.issues,
      },
      { status: 400 }
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
