# adamant-eval-fixture

Controlled evaluation repository for **Adamant Phase 1** (self-healing agent).

This repository contains a clean, passing TypeScript baseline and three deterministic broken commits to evaluate Adamant's end-to-end self-healing capabilities (Actions triage -> diagnosis -> sandbox validation -> PR creation -> automated merge).

## Architecture

- **Runtime**: Node.js 22 (built-in `--test` runner with native `--experimental-strip-types`)
- **Type Checking**: TypeScript 5+ (`tsc --noEmit` in strict mode)
- **CI**: GitHub Actions workflow running on Ubuntu (`.github/workflows/ci.yml`)

## Baseline Verification Commands

```bash
# Typecheck
npm run typecheck

# Unit & Security Tests
npm test

# Full Verification
npm run check
```

## Failure Catalog

| Fixture Branch | Target File | Failure Type | Expected Error | Repro Command |
| :--- | :--- | :--- | :--- | :--- |
| `main` | - | None (Passing Baseline) | Clean exit 0 | `npm run check` |
| `broken-unit-test` | `src/calculator.ts` | Unit-test assertion | `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 120 !== 80` | `npm test` |
| `broken-typecheck` | `src/config.ts` | TypeScript compile error | `error TS2741: Property 'environment' is missing in type '{ host: string; port: number; timeoutMs: number; }'` | `npm run typecheck` |
| `broken-path-security` | `src/path-guard.ts` | Bounded path-traversal check omission | `AssertionError [ERR_ASSERTION]: Missing expected exception (PathTraversalError)` | `npm test` |
