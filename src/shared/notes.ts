import { Type, type Static } from "@sinclair/typebox";

export const NoteSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
});

export const CreateNoteSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200, pattern: "\\S" }),
});

export const NotesSchema = Type.Array(NoteSchema);

export const ErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
  }),
});

export type Note = Static<typeof NoteSchema>;
export type CreateNoteInput = Static<typeof CreateNoteSchema>;
