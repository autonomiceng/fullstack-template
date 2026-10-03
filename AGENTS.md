# Fullstack Template

A reusable full-stack starter with a small, persistent Notes example.

Read [README.md](README.md) for scope and [CONTRIBUTING.md](CONTRIBUTING.md) before preparing changes for review. Check `mise.toml` for the available tools and tasks.

## Ways to hurt yourself

1. **Publishing private material.** Check the destination repository’s visibility before publishing. Keep business-specific code, configuration, branding and migration mappings in a separate private repository. Keep credentials and production records outside Git. Use synthetic data in tests, screenshots, demos and CI. Private filesystem paths and personal details also stay out of public files.
2. **Importing code without provenance.** Check ownership and license compatibility before extracting prototype or third-party code. Preserve required notices; our MIT license applies to our original work.
3. **Touching live systems from development.** Use isolated local fixtures and provider sandboxes. Use synthetic records and isolated databases; production changes need their own approved scope.
4. **Stopping another task's process.** Stop only processes whose identity and ownership you verified. Capture process IDs when starting servers and confirm the working directory before stopping them; avoid pattern-based kills on shared hosts.

## Communication

Short, direct, precise language. State the result, then the evidence. Avoid em dashes and "not X, but Y" phrasing. When a decision is needed, give a few options with consequences and a recommendation. Ask about missing intent; explain technical disagreements briefly.

## Commits

Use Conventional Commits: `<type>(scope): <description>`. Describe the change's benefit. Agents use the maintainer-configured shared Git author and committer identity and preserve commit signing. Verify the effective identity and signing configuration before committing; use that configured identity and preserve signing rather than substituting attribution or bypassing a signing failure. Preserve existing contributor attribution when integrating their work. Follow the task's approval boundary before committing or publishing.

## Documentation and scratch

Keep durable documentation with the behavior it explains. Add an ADR for a consequential tradeoff that would otherwise surprise a future maintainer. Plans, research notes and review transcripts stay in private planning storage; synthetic agent scratch can use ignored directories. Update documentation when behavior or meaning changes.

Finish corrections and remove superseded code within the unmerged PR. Follow
[the cleanup and history policy](CONTRIBUTING.md#commit-history-and-release-notes)
when replacing review iterations or an unreleased schema; preserve released
contracts and migration history used by real installations.

## Interface

Application demos start at the actual shared root and show navigation to changed
behavior on desktop and narrow screens. When introducing authentication, identify
public and protected routes explicitly and verify navigation and access at both
boundaries. Notes remains the approved anonymous local demo.

## Delegation

Follow the task’s review process. Give parallel agents separate worktrees or explicit file ownership. One integrator owns shared manifests, migrations, CI and final integration. Independent code and spec reviews precede PR submission; the implementation author does not replace either review. Read the delivery sequence in [CONTRIBUTING.md](CONTRIBUTING.md).

For new modules or structural changes, follow the reviewed architecture and module contracts. Report missing architecture decisions to the integrator before implementing dependent interfaces or layout. Read the ADRs in `docs/adr/` before changing runtime ownership, contracts, persistence or deployment structure.

## Taste

- Check maintained open-source libraries before building infrastructure.
- Implement the smallest complete vertical slice. Add abstractions when concrete uses justify them.
- Keep domain rules separate from provider adapters and transport code.
- Make dates, money, identity and tenant boundaries explicit.
- Test observable behavior and plausible failures. Use real database integration tests when persistence matters.
- Keep public tooling independent of private repositories and local machine configuration.

## Interface

Use one page title and one useful heading per section. Each label adds information; remove titles and subtitles that repeat visible context. Use shared typography roles and consistent spacing. Keep comparison fields visible and place warnings beside the fields they explain. Use disclosure when it removes substantial secondary information. Review desktop and narrow layouts for redundant copy, visual clutter and hidden navigation.

## Finish

Run `mise run pr:check` before opening or updating a PR. Every PR needs a new benefit-focused changelog fragment, including Maintenance entries for internal improvements; see [CONTRIBUTING.md](CONTRIBUTING.md) for the task contract. Put every required formatter, linter, type check, test and build behind a mise task and include it in that gate when its code arrives. Use `mise run format -- <files...>` only for files intentionally changed; inspect the diff afterwards. Formatter upgrades and broad reformatting need a separate reviewed change. Report exact commands, results and material gaps. Demonstrate application behavior from the reviewed revision and repeat the demo after feedback. A skipped or failed check remains visible. Follow explicit user instructions when they change the workflow.
