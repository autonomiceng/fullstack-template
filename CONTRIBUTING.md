# Contributing

Contributions are welcome under the [MIT license](LICENSE). Read [AGENTS.md](AGENTS.md) before changing the repository.

## Set up

Tool versions and tasks live in `mise.toml`:

```sh
mise trust
mise install
mise run test
```

On Linux, install Chromium’s system libraries once with `mise run browser:deps` (requires administrator privileges). CI runs that task automatically. The pinned browser itself is installed by the test task.

This verifies application behavior and tooling safeguards. Run the full `mise run pr:check` on a contribution branch after staging its new changelog fragment, or on a checked-out PR branch that already includes one. Clean `main` intentionally fails the local PR fragment requirement.

## Checks and formatting

| Task                                             | Purpose                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `mise run deps:install`                          | Install pinned project tools from the frozen Bun lockfile                |
| `mise run format -- <files...>`                  | Format explicitly named, intentionally edited files                      |
| `mise run format:check`                          | Check source, documentation and tooling formatting without writing       |
| `mise run check`                                 | Run formatting, application, contract and specialist checks              |
| `mise run test`                                  | Run application tests and tooling safeguards                             |
| `mise run pr:check`                              | Run all current checks and tests; also used by CI                        |
| `mise run changelog:add -- <category> <summary>` | Create a uniquely named Towncrier fragment                               |
| `mise run changelog:preview`                     | Render draft release notes to stdout without changing files or the index |
| `mise run changelog:check`                       | Validate fragments, rendering and the applicable change policy           |

Run `pr:check` before opening or updating a PR and after resolving conflicts. Checks leave source files unchanged. The formatting task requires regular filenames, validates all inputs before writing, and rejects directory or glob arguments. Quote filenames; do not expand broad shell globs into the command. Inspect `git diff` after formatting and keep unrelated files unchanged.

Vite+ is pinned in `package.json`, and its Oxfmt formatting policy lives in the root `vite.config.ts`. Formatting tasks resolve the installed project-local CLI and configuration explicitly. Bun's exact `packageManager` version matches its mise pin, and `deps:install` uses `bun install --frozen-lockfile`. Tasks that need Vite+ depend on that install task, so the same setup runs locally and in CI. Use mise tasks rather than global installations, unpinned downloads or editor defaults. Formatter upgrades, configuration changes and broad reformatting belong in a separate reviewed change.

mise owns the task graph and PR gate. Vite+ owns formatting, JavaScript lint, integrated type checking and frontend builds; Bun owns frozen dependency installs, backend runtime and backend tests. Playwright exercises the built application in a browser. Node remains available for tool compatibility. ShellCheck, actionlint, EditorConfig and Towncrier cover distinct checks, and the Python changelog tests stay in the gate. Keep one formatting policy and one definition of each required check when adding application tooling.

The application suite contains six backend integration cases and one browser journey using isolated PostgreSQL. Run `mise run test:app` for that suite, `mise run app:check` for application lint and type checks, and `mise run build` for the frontend build. `openapi:check` detects drift in the generated contract; use `openapi:generate` when intentionally changing it. Every required task belongs in `pr:check` when its code arrives. Local checks and CI use the same mise gate with the changelog contexts described below.

## Public interface documentation

`mise run app:check` requires short JSDoc descriptions on public callable contracts
in the four Notes modules selected in `vite.config.ts`. Document side effects,
retry behavior, failure outcomes and caller obligations when they affect correct
use. Explain permissions and tenant scope when a contract has an authentication
or tenant boundary. Notes remains an approved anonymous local demo. Keep
TypeScript as the source of parameter and return types; internal helpers, React
components and test helpers have no comment quota.

Reviewers check accuracy and usefulness, which comment presence cannot establish.
CodeRabbit follows this policy with its blanket percentage check disabled. When
adding a public entrypoint or re-exported factory, include its definition in the
lint scope and extend `scripts/check-documentation.ts` as needed.
`mise run test:documentation` tests missing and empty comments, documented exports
and private helper exclusions in isolated fixtures using the real Vite+ config.
Both tasks run in `pr:check`.

## Deliver a change

1. Propose a small increment with a visible outcome and acceptance criteria. Obtain an independent adversarial plan review, address its findings, and get maintainer approval before implementation. A request to prepare a draft for review authorizes that draft only.
2. Implement the agreed scope using the brief below. Keep private material outside the public checkout and use synthetic fixtures. Review dependency licenses before adding or copying code.
3. Run `mise run pr:check` and the relevant acceptance tasks, then obtain independent code and spec reviews before submitting a PR. Address findings and report unresolved limitations.
4. Open a focused PR describing the problem, resulting behavior, changelog fragment and verification. Include the release-note preview from the reviewed revision. Application changes include a runnable synthetic-data demo of that revision, starting at the actual shared root and navigating to the changed behavior on desktop and narrow screens. When authentication is introduced, identify public and protected routes and demonstrate both access boundaries. Documentation and repository setup changes use the changed files and tooling checks as their review artifact.
5. Address CodeRabbit feedback when available, explaining findings rejected on technical grounds. Report an unavailable review integration. Rerun affected checks and demonstrate fixes until accepted.
6. Merge after required CI checks pass and the owner approves the reviews and exact-revision demo or document/preview review. Use `gh pr merge --squash --match-head-commit <reviewed-head> --subject '<benefit-focused title>' --body-file <message-file>` with an explicitly written final message. Keep automatic merging and administrative bypasses disabled. Honor explicit instructions to stop before committing, pushing or merging.

Keep plans and review transcripts in private planning storage. Publish only reusable documentation and synthetic evidence. Public CI must run without private credentials or repositories.

Use Conventional Commits, for example `docs: explain local checks`. Before committing, verify the repository owner’s configured author, committer and signing settings. Preserve signing and contributor attribution; agents use the configured shared identity. Preserve third-party licenses and notices where required.

## Implementation and review brief

The integrator supplies this brief before delegating work:

- Approved outcome, acceptance cases and exclusions.
- Reviewed architecture/module contracts and applicable instruction-file pointers.
- Missing architecture decisions raised for resolution before dependent implementation.
- Owned files, worktree and exact base commit SHA; the integrator owns shared manifests, migrations and CI.
- Required mise tasks, acceptance cases tied to plausible failures, and expected verification evidence.
- Independent code and spec reviewers, assigned separately from the implementation author.
- Delivery boundary: draft, commit, push, PR or merge, and the required owner approval.
- Final report: changed behavior, exact check commands/results, demo or document artifact, and material risks.

Review findings identify a concrete defect, a plausible failure and supporting evidence. Reviewers check the accepted scope and contracts; tooling handles formatting and style preferences. Keep private paths, identities and review transcripts out of public artifacts. Establish application directories through the reviewed architecture plan when application work begins.

The independent code review also checks unused code and exports, duplicate
helpers, obsolete compatibility or migration scaffolding, and module ownership
and dependency directions against the reviewed architecture. Cleanup findings
name the unnecessary complexity and a concrete simpler alternative; verify their
resolution before merge. Interface reviews use the rendered desktop and narrow
demos to verify accessible navigation and access to secondary actions and fields.

Stop testing once the agreed checks pass. Broaden or repeat checks only for a relevant code change, failure or unresolved risk. Avoid coverage quotas, duplicate assertions across layers and tests that merely repeat implementation details. Authorization and data integrity require verification proportionate to their consequences.

## Commit history and release notes

Default to one focused PR and one squash-merged commit. Write the final commit title and body in plain language: who benefits, what they can now do, and any meaningful limits. Review corrections become part of that final change. Describe internal tooling benefits honestly without claiming a new customer feature.

Finish corrections and remove superseded code in the unmerged PR. Remove
compatibility aliases, extra migrations and obsolete abstractions retained solely
for discarded review iterations. A reviewed change may replace an unmerged
initial schema used only by disposable synthetic demos, with an explicit demo
reset as a separate operation. Preserve contracts and migration history used by
released software or real installations, along with merged main and release
history.

Keep several commits only when each delivers an independently useful change. Fold corrections into their respective commits with fixup/autosquash before final review, coordinate with anyone using the branch, and rerun `mise run pr:check` afterwards. Preserve merged main and release history.

Towncrier renders fragments in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Every PR adds a new nonblank fragment explaining its benefit. Categories are `added`, `changed`, `fixed`, `removed`, `security` and `maintenance`. Maintenance appears separately for contributor and internal improvements; describe those benefits honestly. For example:

```sh
mise run changelog:add -- maintenance "Contributors can preview release notes before review."
git add changes/<generated-fragment>.maintenance.md
mise run pr:check
mise run changelog:preview
```

Use the filename printed by `changelog:add`; see [the fragment contract](changes/README.md). Parallel branches create separate fragments. The preview is a draft, makes no new version claim, and leaves files and the index unchanged. Meaningful summaries remain a reviewer judgment. Unknown fragment files, invalid categories and blank summaries fail validation. Feature PRs cannot edit generated `CHANGELOG.md` to bypass the fragment requirement. Defects corrected before a feature ships belong in that feature's final description; fixes to shipped behavior get their own entries. Include the same benefit-focused summary in the PR and final commit message.

Locally, `changelog:check` reports the merge base of `HEAD` and `origin/main`, then checks both index and working-tree differences from that base. A new fragment must be added in the index or a commit and contain nonblank text in both the index and on disk. Tracked edits to `CHANGELOG.md` in either the index or working tree fail. Untracked fragments can appear in the preview but cannot satisfy the new-fragment requirement. Stage the fragment before running the local gate. A missing remote ref or merge base fails with an actionable message; fetch `origin/main` before checking a branch.

In GitHub Actions, `GITHUB_ACTIONS=true` and `GITHUB_EVENT_NAME=pull_request` select PR checks against the test merge commit's first parent. Both parents must be available; the workflow fetches the required history. Missing merge context fails. `push` and `workflow_dispatch` runs validate syntax and rendering and explicitly skip PR delta checks; unsupported events fail. All contexts use `mise run pr:check`, and CI includes the preview in its job summary.

This tooling creates, validates and previews fragments. Release assembly, version bumps, tags and publishing are deferred to a separate increment.
