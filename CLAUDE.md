# CLAUDE.md

**🚨 CLAUDE BOOTSTRAP METHODOLOGY - STRICT ENFORCEMENT 🚨**

This project follows [Claude Bootstrap](https://github.com/alinaqi/claude-bootstrap) principles:
- **TDD-First Always**: Tests written before code, must fail first
- **Iterative Loops by Default**: Use Ralph Loop for all non-trivial tasks
- **Code Review Mandatory**: `/code-review` before every commit
- **Simplicity Non-Negotiable**: 20 lines/function, 200 lines/file, 3 params max
- **Security First**: No secrets in code, mandatory validation

## Bootstrap Enforcement Rules

### 1. Automatic Ralph Loop Usage

**For ANY non-trivial task, Claude MUST automatically invoke `/ralph-loop`:**

| Task Type | Action |
|-----------|--------|
| New feature (any size) | Auto-invoke `/ralph-loop` with TDD workflow |
| Bug fix | Auto-invoke `/ralph-loop` with bug fix template |
| Refactoring | Auto-invoke `/ralph-loop` with safety tests |
| Multi-file changes | Auto-invoke `/ralph-loop` to iterate until clean |
| Simple explanation | Normal response (no loop) |
| One-line fix/typo | Normal response (no loop) |

**Example:** User says "Add email validation" → Claude automatically invokes Ralph Loop with TDD workflow, doesn't just write the code directly.

### 2. Code Review Before Every Commit

**MANDATORY: Run `/code-review` before creating any commit.**

```bash
# Workflow
Write code → Run tests → Run `/code-review` → Fix Critical/High → Commit
```

**Blocking Rules:**
- 🔴 Critical issues: MUST fix before commit
- 🟠 High issues: MUST fix before commit
- 🟡 Medium/🟢 Low: Advisory, can commit

### 3. Check CODE_INDEX.md Before Writing

**BEFORE creating any new function, Claude MUST:**

1. Read `CODE_INDEX.md` to check for existing capabilities
2. Use `Grep` to search for similar functionality
3. Extend existing code if possible
4. Only create new if nothing suitable exists

**This prevents semantic duplication where AI reimplements existing capabilities.**

### 4. Update Session State Regularly

**Claude MUST update `_project_specs/session/current-state.md`:**

- After completing any todo item
- Every 15-20 tool calls during active work
- After any architectural decision (also log to `decisions.md`)
- When encountering blockers

### 5. TDD Workflow (Non-Negotiable)

**Every feature and bug fix MUST follow:**

```
1. RED    → Write failing tests (prove they catch the requirement)
2. GREEN  → Write minimum code to pass tests
3. REFACTOR → Clean up while keeping tests passing
4. VALIDATE → Lint + TypeCheck + Coverage ≥ 80%
```

**Tests MUST fail before implementation. This proves they work.**

---

## Skills (Read Before Writing Any Code)

Claude MUST read and follow these skills:
- `.claude/skills/base/SKILL.md` - Universal patterns, TDD, Ralph Loop automation
- `.claude/skills/security/SKILL.md` - Security requirements
- `.claude/skills/code-review/SKILL.md` - Review standards
- `.claude/skills/code-deduplication/SKILL.md` - Check before write
- `.claude/skills/commit-hygiene/SKILL.md` - Atomic commits, PR size limits
- `.claude/skills/project-tooling/SKILL.md` - CLI tools
- `.claude/skills/session-management/SKILL.md` - State tracking
- `.claude/skills/typescript/SKILL.md` - TypeScript patterns
- `.claude/skills/react-web/SKILL.md` - React patterns

---

## Project Overview

A horticulture/plant management system built with React and TypeScript for managing plants, gardening operations, and horticulture activities.

**Core Features:**
- F001: Core Logic Engine (Frost date calculations, viability checking)
- F002: Interactive Garden Bed (Click-to-plant grid with LocalStorage)
- F003: Automagic Solver (Constraint satisfaction with companion planting)

---

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Framework**: React + Vite
- **Database**: LocalStorage only (no backend)
- **State Management**: React hooks + LocalStorage persistence
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Coverage Target**: ≥ 80%
- **Deployment**: TBD

---

## Key Commands

```bash
# Verify all CLI tools are working
./scripts/verify-tooling.sh

# Install dependencies
npm install

# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm test -- --coverage   # Run with coverage report

# Quality checks
npm run lint             # Check linting
npm run typecheck        # TypeScript validation
npm run build            # Production build
npm run preview          # Preview production build

# Full validation (before commit)
npm run lint && npm run typecheck && npm test -- --coverage
```

---

## Bootstrap Workflow Example

### Adding a New Feature

```
User: "Add crop rotation recommendations"

Claude (automatic):
1. ✓ Check CODE_INDEX.md for existing rotation logic
2. ✓ Auto-invoke /ralph-loop with TDD workflow
3. ✓ Loop until tests pass + coverage ≥ 80%
4. ✓ Run /code-review
5. ✓ Update CODE_INDEX.md with new capabilities
6. ✓ Update session/current-state.md
7. ✓ Create commit
```

### Fixing a Bug

```
User: "Fix: Automagic Fill not working in January"

Claude (automatic):
1. ✓ Identify test gap (why didn't tests catch this?)
2. ✓ Write failing test that reproduces bug
3. ✓ Verify test FAILS (proves it catches bug)
4. ✓ Auto-invoke /ralph-loop to fix
5. ✓ Loop until test passes + no regressions
6. ✓ Run /code-review
7. ✓ Update session state
8. ✓ Create commit
```

---

## Documentation Structure

```
hortilogic/
├── docs/                          # Technical documentation
│   └── architecture.md            # System design
├── _project_specs/                # Business requirements
│   ├── features/                  # Feature specifications
│   │   ├── 001-core-logic.md
│   │   ├── 002-interactive-grid.md
│   │   └── 003-automagic-solver.md
│   ├── todos/                     # Atomic todos (TDD tracked)
│   │   ├── active.md
│   │   ├── backlog.md
│   │   └── completed.md
│   └── session/                   # Session state (for resumability)
│       ├── current-state.md       # Live session context
│       ├── decisions.md           # Key decisions log
│       ├── code-landmarks.md      # Important code locations
│       └── archive/               # Past session summaries
├── CODE_INDEX.md                  # Capability index (check before write)
└── CLAUDE.md                      # This file
```

---

## Atomic Todos

All work is tracked in `_project_specs/todos/` with **TDD execution logs**.

Every todo must include:
- Acceptance criteria (specific, measurable)
- Test cases table
- TDD execution log (RED → GREEN → VALIDATE phases)
- Dependencies and blockers

See `.claude/skills/base/SKILL.md` for format and examples.

---

## Session Management

### State Tracking Rules

Maintain session state in `_project_specs/session/`:

| File | Purpose | Update When |
|------|---------|-------------|
| `current-state.md` | Live session context | After todos, every 15-20 tool calls |
| `decisions.md` | Architectural decisions | When choosing approaches/patterns |
| `code-landmarks.md` | Important code locations | When creating key files/functions |

### Checkpoint Triggers

Update `current-state.md` when:
- ✓ Completing any todo item
- ✓ Every 15-20 tool calls during active work
- ✓ Before any significant context shift
- ✓ When encountering blockers
- ✓ After making architectural decisions

### Resuming Work

When starting a new session:
1. Read `_project_specs/session/current-state.md`
2. Check `_project_specs/todos/active.md`
3. Review recent `decisions.md` entries if needed
4. Continue from "Next Steps" in current-state.md

---

## Project-Specific Patterns

- **Components**: Functional components with hooks only
- **State**: React hooks + LocalStorage for persistence
- **Styling**: Tailwind utility classes, semantic color tokens
- **Types**: TypeScript strict mode, explicit return types
- **Testing**: Tests alongside features, ≥80% coverage
- **Composition**: Prefer composition over inheritance
- **Simplicity**: 20 lines/function, 200 lines/file max

---

## Security Requirements

**Non-negotiable security rules:**

1. ✓ No secrets in code (use .env)
2. ✓ `.env` in `.gitignore` (never commit)
3. ✓ No secrets in `VITE_*` env vars (client-exposed!)
4. ✓ Validate all external input
5. ✓ No SQL injection (use parameterized queries if DB added)
6. ✓ Dependency scanning in CI

See `.claude/skills/security/SKILL.md` for details.

---

## Quality Gates

### Pre-Commit (Local)
- Linting with auto-fix
- Type checking
- Unit tests
- `/code-review` (mandatory)

### CI (GitHub Actions)
- Full lint + typecheck
- All tests with ≥80% coverage
- Security scanning
- Dependency audit

---

## Bootstrap Opt-Out Phrases

User can opt out of automatic Ralph loops by saying:
- "Just explain..." → Explanation only
- "Quick fix..." → One-liner, no loop
- "Don't loop..." → Explicit opt-out
- "Help me understand..." → Discussion/learning

---

## Enforcement Checklist

Before completing ANY task, Claude must verify:

- [ ] Used Ralph Loop for non-trivial work?
- [ ] Checked CODE_INDEX.md before creating new functions?
- [ ] Followed TDD (RED → GREEN → VALIDATE)?
- [ ] Ran `/code-review` before commit?
- [ ] Updated session/current-state.md?
- [ ] Logged architectural decisions to decisions.md?
- [ ] Coverage ≥ 80%?
- [ ] Simplicity rules followed (20 lines/fn, 200 lines/file)?

**If any checkbox is unchecked, STOP and complete it before proceeding.**
