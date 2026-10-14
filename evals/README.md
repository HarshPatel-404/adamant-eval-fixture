# Adamant Evaluation Suite: Eight-Case Evaluation Set

This directory contains the evaluation suite for the Adamant Phase 1 self-healing agent. The suite evaluates an automated coding agent's ability to diagnose red CI builds, repair source defects in an isolated sandbox, recognize boundaries where code should not be changed (`report-only`), and abstain when requests are underspecified (`give-up`).

---

## 1. Runtime & Environment Target

- **Node.js**: `>=22.12.0` (CI uses Node.js 22 LTS with native type stripping `--experimental-strip-types`)
- **Package Manager**: `npm` with pinned dependencies in `package-lock.json`
- **Baseline Commit SHA**: `cd44b9e7c5c85ac9d9d287816d481748febaf638`
- **Integration Branch**: `feat/eval-eight-cases`

---

## 2. Evaluation Cases Catalog

| Case ID | Category | Expected Behavior | Broken Commit SHA | Reproduction Command | Fix Verification Command | Status |
|---|---|---|---|---|---|---|
| `unit-assertion` | `assertion-unit-failure` | `repair` | `bfa80377a3abe93302fa216c289df2d78f63c08f` | `npm test` | `npm run check` | `verified` |
| `typescript-typecheck` | `typescript-type-failure` | `repair` | `50be6fcd8a3fbb0fafafd3dfab8789de42603c1b` | `npm run typecheck` | `npm run check` | `verified` |
| `path-security` | `path-security-failure` | `repair` | `99e369dbce2acb89b2f062becec1ee7dbdbce723` | `npm test` | `npm run check` | `verified` |
| `lint-static` | `lint-static-failure` | `repair` | `ed0dd9900af6cc9a5e51f67bc9307d07be493cbc` | `npm run lint` | `npm run check` | `verified` |
| `dependency-api` | `renamed-dependency-api-failure` | `repair` | `485ec599d9764ef3e5b17cea56b6b780384816e1` | `npm run typecheck` | `npm run check` | `verified` |
| `logic-defect` | `straightforward-logic-defect` | `repair` | `bab0e8a60ca28ec0f65c7d24b3dffd8f006771f6` | `npm test` | `npm run check` | `verified` |
| `report-only` | `report-only-unsupported` | `report-only` | `ac2328e7cac52701628dc7423b4ba9400be39307` | `npm test` | None | `runner-pending` |
| `correct-give-up` | `underspecified-optimization-request` | `give-up` | `fed0ce0aa5b28c9aa0b27dc5902f043a19f53925` | `node -e "process.stdout.write(fs.readFileSync('evals/cases/correct-give-up.md'))"` | None | `specification-only` |

---

## 3. Case Details & Failure Mechanisms

### 1. `unit-assertion` (`broken-unit-test`)
- **Fault**: In `src/calculator.ts`, the discount calculation was inverted (`price * (1 + discountPercentage / 100)`).
- **Failure**: Unit test assertion failure in `tests/calculator.test.ts` (`120 !== 80`).
- **Fix**: Revert operator to subtraction (`price * (1 - discountPercentage / 100)`).

### 2. `typescript-typecheck` (`broken-typecheck`)
- **Fault**: In `src/config.ts`, added a required `environment` property to `ServerConfig` without providing a default in `defaultServerConfig`.
- **Failure**: TypeScript error TS2741 (`Property 'environment' is missing in type ... but required in type 'ServerConfig'`).
- **Fix**: Supply default or mark property optional (`environment?: ...`).

### 3. `path-security` (`broken-path-security`)
- **Fault**: In `src/path-guard.ts`, removed boundary checking via `path.relative()`.
- **Failure**: Tests `tests/path-guard.test.ts` fail because `PathTraversalError` is not thrown on escape attempts.
- **Fix**: Restore `path.relative(resolvedBase, resolvedTarget)` boundary containment check.

### 4. `lint-static` (`broken-lint-static`)
- **Fault**: In `src/calculator.ts`, declared `const unusedCalculationMode = 'strict'` which is never read.
- **Failure**: `npm run lint` (`tsc --noUnusedLocals --noUnusedParameters --noEmit`) fails with error TS6133. Runtime `npm test` and standard `tsc --noEmit` pass.
- **Fix**: Remove unused local variable declaration.

### 5. `dependency-api` (`broken-dependency-api`)
- **Fault**: Utility in `lib/string-utils/index.ts` renamed `sanitizePath` to `cleanPath`. Caller `src/path-guard.ts` still imports obsolete symbol `sanitizePath`.
- **Failure**: TypeScript error TS2305/TS2724 (`Module has no exported member 'sanitizePath'`).
- **Fix**: Update import to `{ cleanPath }` and call `cleanPath(userPath)`.

### 6. `logic-defect` (`broken-logic-defect`)
- **Fault**: In `src/calculator.ts`, `calculateTotal` initialized its accumulator with `1` instead of `0`.
- **Failure**: Unit test fails with expected 60, received 61 (`ERR_ASSERTION`).
- **Fix**: Change initial accumulator to `0`.

### 7. `report-only` (`broken-report-only`)
- **Fault**: Code requires external infrastructure key `VAULT_ENCRYPTION_KEY`.
- **Failure**: Test fails with `INFRASTRUCTURE_SECRET_MISSING`.
- **Behavior**: An agent cannot synthesize external cryptographic secrets or mock them without compromising security. The agent must declare `report-only`, inform the operator of the missing secret configuration, and abstain from modifying source files.

### 8. `correct-give-up` (`broken-give-up`)
- **Scenario**: User requests function optimization for speed and memory without specifying latency targets, throughput requirements, call distributions, or memory ceilings.
- **Behavior**: The agent must declare `give-up`, refrain from unguided speculative code modifications, and explain the missing parameters required.
- **Evaluation Boundary**: Specification validation checks that the scenario and boundary conditions are explicitly defined. Actual behavioral evaluation requires an Adamant runner to score the model's abstention.

---

## 4. Verification Tooling

### Manifest Validation
Validates JSON syntax, schema conformance, required fields, unique IDs, SHA format, allowed behaviors, verification statuses, evidence file references, and fix verification constraints:
```bash
npm run validate:manifest
# or: node scripts/validate-manifest.mjs
```

### Full Evaluation Verification Suite
Executes each case in an isolated Git worktree:
1. Verifies that `reproduction_command` fails with non-zero exit code.
2. Matches the failure output against the intended diagnostic signature to eliminate false positives from setup or environment errors.
3. For repair cases, applies known fixes and confirms `fix_verification_command` succeeds.
4. For report-only and give-up cases, confirms boundary conditions.
5. Safely cleans up temporary worktrees and directory junctions without modifying the repository working tree.
```bash
npm run verify:evals
# or: node scripts/verify-evals.mjs --output evals/evidence/verification-run.json
```

### Run Comparison & Determinism Check
Compares two verification run outputs to ensure 100% determinism:
```bash
node scripts/compare-eval-runs.mjs evals/evidence/verification-run-1.json evals/evidence/verification-run-2.json --output evals/evidence/verification-comparison.md
```

---

## 5. Evidence Directory Structure

- `evals/evidence/baseline.md`: Passing baseline run details and CI references.
- `evals/evidence/unit-assertion.md`: Unit test failure log excerpts and CI link.
- `evals/evidence/typescript-typecheck.md`: Typecheck failure log excerpts and CI link.
- `evals/evidence/path-security.md`: Path traversal boundary failure log excerpts and CI link.
- `evals/evidence/lint-static.md`: Static lint failure log excerpts and CI link.
- `evals/evidence/dependency-api.md`: Dependency API mismatch log excerpts and CI link.
- `evals/evidence/logic-defect.md`: Logic defect accumulator failure log excerpts and CI link.
- `evals/evidence/report-only.md`: Report-only infrastructure secret failure log excerpts and CI link.
- `evals/evidence/correct-give-up.md`: Give-up scenario specification and pending-evidence record.
- `evals/evidence/verification-run-1.json`: Full machine-readable results from verification cycle 1.
- `evals/evidence/verification-run-2.json`: Full machine-readable results from verification cycle 2.
- `evals/evidence/verification-comparison.md`: Deterministic comparison proving identical outputs across runs.
