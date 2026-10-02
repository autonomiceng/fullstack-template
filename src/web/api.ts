import type { CreateNoteInput, Note } from "../shared/notes";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function errorMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null || !("error" in body)) return;
  const error = body.error;
  if (typeof error !== "object" || error === null || !("message" in error))
    return;
  return typeof error.message === "string" ? error.message : undefined;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    if (options?.signal?.aborted) throw error;
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      // A proxy or unavailable server may return a non-JSON error.
    }
    throw new ApiError(
      errorMessage(body) ??
        "The request could not be completed. Please try again.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function listNotes(signal?: AbortSignal): Promise<Note[]> {
  return request<Note[]>("/api/notes", { signal });
}

export function createNote(input: CreateNoteInput): Promise<Note> {
  return request<Note>("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
