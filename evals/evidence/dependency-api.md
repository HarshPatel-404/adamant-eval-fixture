# Evidence: dependency-api

- **Case ID**: `dependency-api`
- **Category**: `renamed-dependency-api-failure`
- **Broken SHA**: `485ec599d9764ef3e5b17cea56b6b780384816e1`
- **Branch**: `broken-dependency-api`
- **Expected Behavior**: `repair`
- **Reproduction Command**: `npm run typecheck`
- **Fix Verification Command**: `npm run check`
- **GitHub Actions Run URL**: https://github.com/HarshPatel-404/adamant-eval-fixture/actions/runs/38556285841
- **Run ID**: `38556285841`
- **Job ID**: `115826140217`
- **Workflow Conclusion**: `failure`

## CI Step Execution

| Step Name | Conclusion |
|---|---|
| Check out repository | success |
| Set up Node.js | success |
| Install dependencies | success |
| Typecheck | failure |
| Run tests | skipped |

## Failure Mechanism

In `lib/string-utils/index.ts`, `sanitizePath` was renamed to `cleanPath`.
In `src/path-guard.ts`, the old exported symbol name was still imported:
```typescript
// API INCOMPATIBILITY: 'sanitizePath' was renamed to 'cleanPath' in lib/string-utils v2.0
import { sanitizePath } from '../lib/string-utils/index.ts'
```

## Reproduction Output Excerpt

```text
> adamant-eval-fixture@1.0.0 typecheck
> tsc --noEmit

src/path-guard.ts(3,10): error TS2305: Module '"../lib/string-utils/index.ts"' has no exported member 'sanitizePath'.
```

## Repair Strategy

Update `src/path-guard.ts` to import `cleanPath` from `'../lib/string-utils/index.ts'` and invoke `cleanPath(userPath)`.
Verification is confirmed via `npm run check`.
