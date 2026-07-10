# CLAUDE.md

## Project Overview

A horticulture/plant management system built with React and TypeScript for managing plants, gardening operations, and horticulture activities.

**Core Features:**
- F001: Core Logic Engine (Frost date calculations, viability checking)
- F002: Interactive Garden Bed (Click-to-plant grid with LocalStorage)
- F003: Automagic Solver (Constraint satisfaction with companion planting)

Feature specs live in `_project_specs/features/`.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: React + Vite
- **Database**: LocalStorage only (no backend)
- **State Management**: React hooks + LocalStorage persistence
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

## Key Commands

```bash
# Verify CLI tooling (gh, node, npm)
./scripts/verify-tooling.sh

# Install dependencies
npm ci

# Development
npm run dev              # Start dev server (http://localhost:5173)

# Testing
CI=true npx vitest run           # Run tests once and exit
npm run test:watch               # Watch mode (interactive; do not use in scripts/CI)
CI=true npm run test:coverage    # Run once with coverage report

# NOTE: plain `npm test` is `vitest` — in a local terminal it enters
# watch mode and never exits. For a one-shot run, use the forms above.

# Quality checks
npm run lint             # ESLint
npm run typecheck        # tsc -b --noEmit
npm run build            # Production build (tsc -b && vite build)
npm run preview          # Preview production build

# Full validation (before commit)
npm run lint && npm run typecheck && CI=true npx vitest run
```

## CI (GitHub Actions)

What CI actually enforces on push/PR to `main`:

- **quality.yml**: `npm run lint`, `npm run typecheck`, `npm test` (runs once under CI), `npm run build`
- **security.yml**: TruffleHog secrets scan, `npm audit --audit-level=high` (also weekly)

There is no coverage threshold in CI or in `vitest.config.ts`. Keep lint, typecheck, tests, and build green — those are the gates.

## Security

- No secrets in code — use environment variables
- `.env` stays in `.gitignore`
- No secrets in `VITE_*` env vars (they are client-exposed)
- CI scans for secrets and audits dependencies (see above)

## Project Patterns

Conventions observed in the codebase:

- **Components**: Functional components with hooks only
- **State**: React hooks + LocalStorage for persistence
- **Styling**: Tailwind utility classes
- **Types**: TypeScript strict mode
- **Testing**: Vitest + React Testing Library, test files alongside features (`*.test.ts(x)`)
- **Data validation**: Crop catalog is JSON validated with Zod at module load (`src/schemas/crop.ts`)

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
