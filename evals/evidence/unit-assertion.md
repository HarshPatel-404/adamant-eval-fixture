# Evidence: unit-assertion

- **Case ID**: `unit-assertion`
- **Category**: `assertion-unit-failure`
- **Broken SHA**: `bfa80377a3abe93302fa216c289df2d78f63c08f`
- **Branch**: `broken-unit-test`
- **Expected Behavior**: `repair`
- **Reproduction Command**: `npm test`
- **Fix Verification Command**: `npm run check`
- **GitHub Actions Run URL**: https://github.com/HarshPatel-404/adamant-eval-fixture/actions/runs/36555529358
- **Run ID**: `36555529358`
- **Job ID**: `109363636039`
- **Workflow Conclusion**: `failure`

## CI Step Execution

| Step Name | Conclusion |
|---|---|
| Check out repository | success |
| Set up Node.js | success |
| Install dependencies | success |
| Typecheck | success |
| Run tests | failure |

## Failure Mechanism

In `src/calculator.ts`, the discount calculation was inverted to add the discount percentage rather than subtract it:
```typescript
-  return price * (1 - discountPercentage / 100)
+  // BUG: Inverted calculation adds discount percentage instead of subtracting it
+  return price * (1 + discountPercentage / 100)
```

## Reproduction Output Excerpt

```text
> adamant-eval-fixture@1.0.0 test
> node --experimental-strip-types --test tests/calculator.test.ts tests/config.test.ts tests/path-guard.test.ts

✔ calculateTotal sums array of numbers correctly (0.5802ms)
✖ calculateDiscount applies valid discount correctly (0.6892ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  120 !== 80
```

## Repair Strategy

Restore the subtraction operation in `calculateDiscount`: `price * (1 - discountPercentage / 100)`.
Verification is confirmed via `npm run check`.
