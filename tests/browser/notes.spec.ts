import { expect, test } from "@playwright/test";

test("create a note with the keyboard and see it after a reload", async ({
  page,
}) => {
  let releaseNotes: () => void = () => {};
  const notesReady = new Promise<void>((resolve) => {
    releaseNotes = resolve;
  });
  await page.route("**/api/notes", async (route) => {
    await notesReady;
    await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Loading your notes…" }),
  ).toBeVisible();
  releaseNotes();
  await expect(
    page.getByRole("heading", { name: "No notes yet" }),
  ).toBeVisible();
  await page.unroute("**/api/notes");

  const form = page.getByRole("form", { name: "Create a note" });
  const title = form.getByRole("textbox", { name: "Note title" });
  await title.fill("Remember to enjoy the small things");
  await title.press("Enter");

  await expect(form.getByRole("status")).toHaveText(
    "Saved “Remember to enjoy the small things”.",
  );
  const notes = page.getByRole("list", { name: "Saved notes" });
  await expect(
    notes.getByRole("heading", {
      name: "Remember to enjoy the small things",
      exact: true,
    }),
  ).toBeVisible();
  await expect(title).toHaveValue("");

  await page.reload();
  await expect(
    page.getByRole("list", { name: "Saved notes" }).getByRole("heading", {
      name: "Remember to enjoy the small things",
      exact: true,
    }),
  ).toBeVisible();

  await page.route("**/api/notes", (route) => route.abort("failed"));
  await page.reload();
  await expect(page.getByRole("alert")).toHaveText(
    "Could not reach the server. Check your connection and try again.",
  );
  await page.unroute("**/api/notes");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("list", { name: "Saved notes" }).getByRole("heading", {
      name: "Remember to enjoy the small things",
      exact: true,
    }),
  ).toBeVisible();
});
