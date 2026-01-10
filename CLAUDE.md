# CLAUDE.md

## Skills
Read and follow these skills before writing any code:
- .claude/skills/base/SKILL.md
- .claude/skills/security/SKILL.md
- .claude/skills/project-tooling/SKILL.md
- .claude/skills/session-management/SKILL.md
- .claude/skills/typescript/SKILL.md
- .claude/skills/react-web/SKILL.md

## Project Overview
A horticulture/plant management system built with React and TypeScript for managing plants, gardening operations, and horticulture activities.

## Tech Stack
- **Language**: TypeScript
- **Framework**: React + Vite
- **Database**: Local storage / IndexedDB (no backend)
- **State Management**: TBD (React Query, Zustand, or Context)
- **Styling**: TBD (Tailwind CSS, styled-components, or CSS modules)
- **Testing**: Vitest + React Testing Library
- **Deployment**: TBD

## Key Commands
```bash
# Verify all CLI tools are working
./scripts/verify-tooling.sh

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Documentation
- `docs/` - Technical documentation
- `_project_specs/` - Project specifications and todos

## Atomic Todos
All work is tracked in `_project_specs/todos/`:
- `active.md` - Current work
- `backlog.md` - Future work
- `completed.md` - Done (for reference)

Every todo must have validation criteria and test cases. See base/SKILL.md for format.

## Session Management

### State Tracking
Maintain session state in `_project_specs/session/`:
- `current-state.md` - Live session state (update every 15-20 tool calls)
- `decisions.md` - Key architectural/implementation decisions (append-only)
- `code-landmarks.md` - Important code locations for quick reference
- `archive/` - Past session summaries

### Automatic Updates
Update `current-state.md`:
- After completing any todo item
- Every 15-20 tool calls during active work
- Before any significant context shift
- When encountering blockers

### Decision Logging
Log to `decisions.md` when:
- Choosing between architectural approaches
- Selecting libraries or tools
- Making security-related choices
- Deviating from standard patterns

### Context Compression
When context feels heavy (~50+ tool calls):
1. Summarize completed work in current-state.md
2. Archive verbose exploration notes to archive/
3. Keep only essential context for next steps

### Session Handoff
When ending a session or approaching context limits, update current-state.md with:
- What was completed this session
- Current state of work
- Immediate next steps (numbered, specific)
- Open questions or blockers
- Files to review first when resuming

### Resuming Work
When starting a new session:
1. Read `_project_specs/session/current-state.md`
2. Check `_project_specs/todos/active.md`
3. Review recent entries in `decisions.md` if context needed
4. Continue from "Next Steps" in current-state.md

## Project-Specific Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript strict mode
- Write tests alongside features
