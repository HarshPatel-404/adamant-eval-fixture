# Evidence: lint-static

- **Case ID**: `lint-static`
- **Category**: `lint-static-failure`
- **Broken SHA**: `ed0dd9900af6cc9a5e51f67bc9307d07be493cbc`
- **Branch**: `broken-lint-static`
- **Expected Behavior**: `repair`
- **Reproduction Command**: `npm run lint`
- **Fix Verification Command**: `npm run check`
- **GitHub Actions Run URL**: https://github.com/HarshPatel-404/adamant-eval-fixture/actions/runs/38290194526
- **Run ID**: `38290194526`
- **Job ID**: `114948161565`
- **Workflow Conclusion**: `failure`

## CI Step Execution

| Step Name | Conclusion |
|---|---|
| Check out repository | success |
| Set up Node.js | success |
| Install dependencies (`npm ci`) | success |
| Lint (`npm run lint`) | failure |
| Typecheck | skipped |
| Run tests | skipped |

## Failure Mechanism

In `package.json`, a static lint check `tsc --noUnusedLocals --noUnusedParameters --noEmit` was defined.
In `src/calculator.ts`, an unused local variable was introduced:
```typescript
export function calculateDiscount(price: number, discountPercentage: number): number {
  // LINT BUG: Unused local variable triggers error TS6133 under --noUnusedLocals
  const unusedCalculationMode = 'strict'
```
Note: Standard `tsc --noEmit` and runtime `npm test` both pass, confirming this is genuinely a static analysis / lint failure rather than a unit test or syntax failure.

## Reproduction Output Excerpt

```text
> adamant-eval-fixture@1.0.0 lint
> tsc --noUnusedLocals --noUnusedParameters --noEmit

src/calculator.ts(11,9): error TS6133: 'unusedCalculationMode' is declared but its value is never read.
```

## Repair Strategy

Remove the unused declaration `const unusedCalculationMode = 'strict'` from `src/calculator.ts`.
Verification is confirmed via `npm run check`.
