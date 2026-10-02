import { desc } from "drizzle-orm";
import type { CreateNoteInput, Note } from "../shared/notes";
import type { Database } from "./db/connection";
import { notes } from "./db/schema";

function toNote(row: typeof notes.$inferSelect): Note {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export async function listNotes(db: Database): Promise<Note[]> {
  const rows = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt), desc(notes.id))
    .limit(100);
  return rows.map(toNote);
}

export async function createNote(
  db: Database,
  input: CreateNoteInput,
): Promise<Note> {
  const [row] = await db
    .insert(notes)
    .values({ title: input.title.trim() })
    .returning();
  if (!row) throw new Error("Insert did not return a note");
  return toNote(row);
}
