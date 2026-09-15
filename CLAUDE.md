# PipelineFlow (training framing: a loan/claims case tracker)
# — instructions for coding agents

- Stack: Next.js 15 (App Router) + TypeScript. Cases are stored in an
  in-memory Map (lib/store.ts) — there is no database. Do not add one.
- Training framing: every "issue" in this codebase represents a loan or
  claims case moving through a pipeline (backlog/todo/in_progress/done
  = Submitted/Document Review/Underwriting/Decisioned). Treat case data
  as regulated for the purposes of this exercise.
- Do not add a new third-party dependency without calling it out
  explicitly in the PR description.
- This project has no test runner configured yet. If a task needs
  verification and no test setup exists, set up a minimal one
  (vitest is preferred) as part of the task, and say so in the PR
  description — do not skip verification because tooling is missing.
- Never write or accept a `status` value that isn't one of the four
  keys in STATUSES (lib/types.ts).
- Run whatever test command exists (or the one you just set up)
  before declaring a task complete.
