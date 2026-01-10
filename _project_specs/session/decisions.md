<!--
LOG DECISIONS WHEN:
- Choosing between architectural approaches
- Selecting libraries or tools
- Making security-related choices
- Deviating from standard patterns

This is append-only. Never delete entries.
-->

# Decision Log

Track key architectural and implementation decisions.

## Format
```
## [YYYY-MM-DD] Decision Title

**Decision**: What was decided
**Context**: Why this decision was needed
**Options Considered**: What alternatives existed
**Choice**: Which option was chosen
**Reasoning**: Why this choice was made
**Trade-offs**: What we gave up
**References**: Related code/docs
```

---

## [2026-01-09] Tech Stack Selection

**Decision**: React + Vite + TypeScript + Tailwind CSS + Lucide-React

**Context**: Need to build a desktop-first parametric garden planner with interactive grid UI and date calculations.

**Options Considered**:
- Next.js (overkill for local-first app)
- Plain React with CRA (deprecated)
- Vite + React (fast, modern)

**Choice**: Vite + React with TypeScript strict mode

**Reasoning**:
- Vite provides fast dev server and HMR
- TypeScript ensures type safety for complex date calculations and constraints
- Tailwind CSS for rapid UI development
- Lucide-React for consistent icon system

**Trade-offs**:
- No SSR/SSG (not needed for local-first app)
- Tailwind requires learning utility classes

**References**: _project_specs/overview.md

---

## [2026-01-09] Storage Strategy

**Decision**: LocalStorage only (no backend)

**Context**: MVP should be simple, privacy-focused, and work offline

**Options Considered**:
- Supabase (adds complexity, requires auth)
- Firebase (vendor lock-in)
- LocalStorage (simple, private)
- IndexedDB (more complex API)

**Choice**: LocalStorage with JSON serialization

**Reasoning**:
- Zero setup, works immediately
- User data stays private (never leaves browser)
- Perfect for MVP scope
- Can migrate to IndexedDB later if needed

**Trade-offs**:
- No multi-device sync
- Storage limits (~5-10MB)
- No backup/restore (yet)

**References**: _project_specs/overview.md

---

## [2026-01-09] Enforce Claude Bootstrap Methodology

**Decision**: Strictly enforce Claude Bootstrap principles as default behavior

**Context**: After completing Feature 003, user requested that Claude follow Bootstrap methodology (from github.com/alinaqi/claude-bootstrap) for all future work to maintain code quality and prevent complexity creep.

**Options Considered**:
- Continue with current approach (ad-hoc methodology)
- Adopt Bootstrap principles loosely (optional)
- Enforce Bootstrap strictly (mandatory)

**Choice**: Enforce Bootstrap strictly as default behavior

**Reasoning**:
- TDD prevents bugs from shipping (tests fail first, then implementation)
- Ralph Loop automation reduces manual iteration overhead
- Code review catches security/performance issues before commit
- CODE_INDEX.md prevents semantic duplication
- Complexity limits (20 lines/fn, 200 lines/file) keep codebase maintainable
- Session state management enables resumability across sessions

**Key Enforcement Rules**:
1. Auto-invoke `/ralph-loop` for non-trivial tasks (features, bugs, refactoring)
2. Run `/code-review` before every commit (mandatory, blocks on Critical/High)
3. Check CODE_INDEX.md before creating functions (prevents duplication)
4. Update session/current-state.md every 15-20 tool calls
5. Follow TDD: RED → GREEN → VALIDATE (tests must fail before implementation)

**Trade-offs**:
- More upfront process (write tests first, run reviews)
- May feel slower initially (but prevents rework later)
- Requires discipline to follow checklist before completing tasks

**References**:
- CLAUDE.md (updated with Bootstrap rules)
- CODE_INDEX.md (created)
- .claude/skills/base/SKILL.md (contains Ralph Loop automation rules)
