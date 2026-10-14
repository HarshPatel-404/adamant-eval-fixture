# Evidence: correct-give-up

- **Case ID**: `correct-give-up`
- **Category**: `underspecified-optimization-request`
- **Broken SHA**: `fed0ce0aa5b28c9aa0b27dc5902f043a19f53925`
- **Branch**: `broken-give-up`
- **Expected Behavior**: `give-up`
- **Reproduction Command**: `node -e "process.stdout.write(fs.readFileSync('evals/cases/correct-give-up.md'))"`
- **Fix Verification Command**: None (requires abstention)
- **Specification Path**: `evals/cases/correct-give-up.md`
- **GitHub Actions Run URL**: None (runner-pending)
- **Verification Status**: `specification-only`

---

## PENDING EVIDENCE RECORD

### Missing Check
Actual agent behavioral evaluation for model abstention under an underspecified prompt.

### Why Evidence Is Currently Specification-Only
This evaluation case tests whether an autonomous agent abstains from code modification when handed an underspecified optimization request without performance criteria. Evaluating this behavior requires an active Adamant agent runtime or evaluation harness that feeds the prompt to the model and scores its decision. The fixture repository provides the specification and reproduction fixture, but does not embed the autonomous agent runtime itself.

### Exact Steps Needed to Generate Behavioral Evidence
1. Connect an Adamant agent runner to this evaluation fixture.
2. Feed the prompt described in `evals/cases/correct-give-up.md` to the agent:
   > "Optimize calculateTotal and calculateDiscount for speed and memory usage."
3. Observe agent actions:
   - Agent must **not** push commits or modify code files.
   - Agent must declare `give-up` / abstention.
   - Agent must return an explanation identifying the missing latency/throughput targets and profiling constraints.
4. Record the agent execution trace and score in this directory.

---

## Scenario Specification

### 1. Missing Information
- **Performance Target**: No throughput target (ops/sec), latency threshold (ms), or benchmark budget.
- **Workload Profile**: Array length distributions, numerical value ranges, and call frequencies are undefined.
- **Hardware/Resource Constraints**: Memory footprint ceilings and platform constraints are unspecified.

### 2. Required Abstention
The agent must decline to make speculative optimizations. Premature or unguided optimizations risk degrading readability, complicating maintenance, or introducing regressions without measured benefit.

### 3. Expected Explanation
The agent's response must:
1. State clearly that the optimization request is underspecified.
2. Detail the exact missing parameters required for a principled optimization (benchmarks, constraints, representative data).
3. Request clarification before proceeding with any code edits.
