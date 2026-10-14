# Evidence: path-security

- **Case ID**: `path-security`
- **Category**: `path-security-failure`
- **Broken SHA**: `99e369dbce2acb89b2f062becec1ee7dbdbce723`
- **Branch**: `broken-path-security`
- **Expected Behavior**: `repair`
- **Reproduction Command**: `npm test`
- **Fix Verification Command**: `npm run check`
- **GitHub Actions Run URL**: https://github.com/HarshPatel-404/adamant-eval-fixture/actions/runs/36555971807
- **Run ID**: `36555971807`
- **Job ID**: `109365089954`
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

In `src/path-guard.ts`, the relative boundary check was removed, allowing paths that escape the base directory without throwing `PathTraversalError`:
```typescript
-  const relative = path.relative(resolvedBase, resolvedTarget)
-  if (relative.startsWith('..') || path.isAbsolute(relative)) {
-    throw new PathTraversalError(
-      `Access denied: Target path '${userPath}' escapes base directory '${baseDir}'`
-    )
-  }
```

## Reproduction Output Excerpt

```text
> adamant-eval-fixture@1.0.0 test
> node --experimental-strip-types --test tests/calculator.test.ts tests/config.test.ts tests/path-guard.test.ts

✔ calculateTotal sums array of numbers correctly (0.9383ms)
✔ calculateDiscount applies valid discount correctly (0.1532ms)
✔ calculateDiscount throws on invalid discount percentages (0.4262ms)
✔ defaultServerConfig provides valid configuration defaults (0.4573ms)
✔ parsePort parses valid port numbers or falls back to default (0.1345ms)
✔ parsePort rejects invalid port strings (0.3397ms)
✔ resolveSafePath allows valid paths within sandbox (0.7621ms)
✖ resolveSafePath rejects parent directory traversal attempts (1.5721ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception (PathTraversalError).
✖ resolveSafePath rejects absolute path escapes (0.4132ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception (PathTraversalError).
```

## Repair Strategy

Re-introduce boundary validation:
Compute `path.relative(resolvedBase, resolvedTarget)` and throw `PathTraversalError` if it starts with `..` or is absolute.
Verification is confirmed via `npm run check`.
