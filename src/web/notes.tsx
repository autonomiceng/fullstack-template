import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, listNotes } from "./api";

const notesKey = ["notes"] as const;
const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Notes() {
  const [title, setTitle] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const titleInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const notes = useQuery({
    queryKey: notesKey,
    queryFn: ({ signal }) => listNotes(signal),
  });
  const saveNote = useMutation({
    mutationFn: createNote,
    onSuccess: async (note) => {
      setTitle("");
      setSavedMessage(`Saved “${note.title}”.`);
      await queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });

  useEffect(() => {
    if (saveNote.isSuccess && !saveNote.isPending) titleInput.current?.focus();
  }, [saveNote.isSuccess, saveNote.isPending]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saveNote.isPending || !title.trim()) return;
    setSavedMessage("");
    saveNote.mutate({ title });
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title">Notes</h1>
        <p className="intro-description">
          Capture a thought, keep a reminder, or leave yourself a note for
          later.
        </p>
      </section>

      <div className="notes-layout">
        <section
          className="panel compose-panel"
          aria-labelledby="compose-title"
        >
          <h2 id="compose-title">New note</h2>
          <form onSubmit={submit} aria-label="Create a note">
            <label htmlFor="note-title">Note title</label>
            <input
              ref={titleInput}
              id="note-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSavedMessage("");
                if (saveNote.isError) saveNote.reset();
              }}
              required
              maxLength={200}
              disabled={saveNote.isPending}
              placeholder="An idea worth keeping…"
              aria-describedby="title-hint"
              autoComplete="off"
            />
            <p id="title-hint" className="field-hint">
              Keep it short. Up to 200 characters.
            </p>
            <button
              type="submit"
              disabled={saveNote.isPending || !title.trim()}
            >
              {saveNote.isPending ? "Saving…" : "Save note"}
            </button>
            <div className="form-feedback">
              <p role="status">
                {saveNote.isPending ? "Saving your note…" : savedMessage}
              </p>
              {saveNote.isError && (
                <p role="alert" className="error-text">
                  {saveNote.error.message}
                </p>
              )}
            </div>
          </form>
          <p className="compose-caption">
            Saved to the server, ready when you return.
          </p>
        </section>

        <section
          className="collection"
          aria-labelledby="collection-title"
          aria-busy={notes.isFetching}
        >
          <div className="collection-heading">
            <h2 id="collection-title">Your notes</h2>
            {notes.data && (
              <span className="note-count" aria-hidden="true">
                {notes.data.length}
              </span>
            )}
          </div>
          <p className="collection-description">
            The latest 100 notes, newest first.
          </p>
          {notes.isPending && (
            <div className="panel state-panel" role="status">
              Loading your notes…
            </div>
          )}
          {notes.isError && (
            <div className="panel state-panel error-state">
              <h3>Notes could not load</h3>
              <p role="alert" className="error-text">
                {notes.error.message}
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => void notes.refetch()}
                disabled={notes.isFetching}
              >
                {notes.isFetching ? "Trying again…" : "Try again"}
              </button>
            </div>
          )}
          {notes.data?.length === 0 && (
            <div className="panel state-panel">
              <span className="empty-mark" aria-hidden="true">
                ✦
              </span>
              <h3>No notes yet</h3>
              <p>Notes you save will appear here.</p>
            </div>
          )}
          {notes.data && notes.data.length > 0 && (
            <ul className="note-list" aria-label="Saved notes">
              {notes.data.map((note) => (
                <li key={note.id} className="panel note-card">
                  <h3>{note.title}</h3>
                  <time dateTime={note.createdAt}>
                    {dateFormat.format(new Date(note.createdAt))}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
