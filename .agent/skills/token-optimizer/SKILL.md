---
name: token-optimizer
description: Guides codebase editing with minimal token consumption, targeted line replacements, dependency deduplication, and context-preserving refactoring. Activates on refactoring, large file edits, and code optimizations.
---

# Antigravity Context & Token Optimization Protocol

## Strict Editing Constraints
1. Target only AST nodes or explicit line blocks.
2. Refrain from re-writing test fixtures or mock data when creating features. Use deterministic generators.
3. For schema modifications, write standalone migration scripts rather than re-outputting the entire database schema file.
4. When logging errors in terminal execution within Antigravity, parse output to isolate line errors—never paste full stack traces into agent context.
