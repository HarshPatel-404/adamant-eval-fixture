# Baseline Verification Evidence

- **Repository**: `HarshPatel-404/adamant-eval-fixture`
- **Branch**: `main`
- **Commit SHA**: `cd44b9e7c5c85ac9d9d287816d481748febaf638`
- **GitHub Actions Run URL**: https://github.com/HarshPatel-404/adamant-eval-fixture/actions/runs/36555099870
- **Workflow Run ID**: `36555099870`
- **Job ID**: `109362244259`
- **Status**: Completed (`success`)
- **Node.js Target**: `22`

## CI Workflow Step Summary

| Step | Status |
|------|--------|
| Set up job | success |
| Check out repository | success |
| Set up Node.js | success |
| Install dependencies | success |
| Typecheck (`npm run typecheck`) | success |
| Run tests (`npm test`) | success |

## Local Baseline Verification Output

```text
> adamant-eval-fixture@1.0.0 typecheck
> tsc --noEmit

> adamant-eval-fixture@1.0.0 test
> node --experimental-strip-types --test tests/calculator.test.ts tests/config.test.ts tests/path-guard.test.ts

✔ calculateTotal sums array of numbers correctly (1.0819ms)
✔ calculateDiscount applies valid discount correctly (0.2175ms)
✔ calculateDiscount throws on invalid discount percentages (0.5455ms)
✔ defaultServerConfig provides valid configuration defaults (0.5613ms)
✔ parsePort parses valid port numbers or falls back to default (0.1112ms)
✔ parsePort rejects invalid port strings (0.3403ms)
✔ resolveSafePath allows valid paths within sandbox (0.7849ms)
✔ resolveSafePath rejects parent directory traversal attempts (0.4586ms)
✔ resolveSafePath rejects absolute path escapes (0.1942ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
```
