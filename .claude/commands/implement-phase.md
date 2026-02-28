# Implement Phase $ARGUMENTS

You are implementing Phase $ARGUMENTS of the AutoTheme project.

## Instructions

1. **Read the phase documentation** at `docs/phases/0$ARGUMENTS-*.md` to understand what needs to be built

2. **Create a todo list** from the "Deliverables" section in the phase doc - each checkbox item becomes a todo

3. **Implement each deliverable** by:
   - Reading any existing code that the new code will integrate with
   - Writing the code according to the specifications in the phase doc
   - Following the file structure specified in the phase doc
   - Using the data structures and function signatures shown in the doc

4. **Write tests** in `tests/` mirroring the `src/` structure (e.g., `src/core/color.ts` → `tests/core/color.test.ts`)

5. **Run verification** commands from the phase doc's "Verification" section after completing implementation

## Guidelines

- Follow TypeScript strict mode - no `any` types
- Use the existing project patterns (check CLAUDE.md for conventions)
- All color math is implemented from scratch (zero external dependencies for core logic)
- HSL is the internal color representation
- CSS variables use space-separated RGB format: `"255 128 64"` not `rgb(255, 128, 64)`
- Target WCAG AAA (7:1 contrast ratio) for accessible text colors
- JSON only for configuration (no YAML)

## After Implementation

- Mark all todos as completed
- Run `bun run check` to verify everything passes
- Summarize what was implemented and any deviations from the spec
