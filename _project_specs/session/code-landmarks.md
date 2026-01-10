<!--
UPDATE WHEN:
- Adding new entry points or key files
- Introducing new patterns
- Discovering non-obvious behavior

Helps quickly navigate the codebase when resuming work.
-->

# Code Landmarks

Quick reference to important parts of the codebase.

## Entry Points
| Location | Purpose |
|----------|---------|
| src/main.tsx | Application entry point |
| index.html | HTML template |

## Core Business Logic
| Location | Purpose |
|----------|---------|
| src/types/ | TypeScript interfaces for Crop, GardenProfile, etc. |
| src/utils/dateEngine.ts | Frost date calculations (relative to absolute) |
| src/utils/solver.ts | "Automagic" crop suggestion algorithm |

## Configuration
| Location | Purpose |
|----------|---------|
| vite.config.ts | Vite build configuration |
| tsconfig.json | TypeScript compiler settings |
| tailwind.config.js | Tailwind CSS customization |

## Key Patterns
| Pattern | Example Location | Notes |
|---------|------------------|-------|
| LocalStorage hooks | src/hooks/useLocalStorage.ts | Custom hook for persistent state |
| Grid rendering | src/components/Grid.tsx | 4x8 SFG cell visualization |
| Context providers | src/context/GardenContext.tsx | Global garden state management |

## Testing
| Location | Purpose |
|----------|---------|
| src/**/*.test.tsx | Component tests (co-located) |
| src/utils/*.test.ts | Unit tests for utilities |

## Gotchas & Non-Obvious Behavior
| Location | Issue | Notes |
|----------|-------|-------|
| - | - | Will update as discovered |
