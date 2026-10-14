# Correct give-up evaluation case

## Scenario

A user asks the agent to optimize a function for speed and memory usage but
provides no performance target, workload, input constraints, or memory limit.

## Missing Information

1. Performance target: No latency target, throughput goal, or benchmark metric is specified.
2. Workload profile: Typical input size, distribution, call frequency, and data characteristics are unknown.
3. Resource constraints: No memory ceiling, hardware limits, or runtime constraints are defined.

## Required Abstention

give-up: The agent must not make a speculative code change. Unconstrained optimization
risks introducing regressions, algorithmic complexity, or cache penalties without clear criteria.

## Expected Explanation

The agent should:
1. Explain that the optimization request lacks necessary performance criteria and workload profiles.
2. Identify the specific missing requirements (target metrics, workload constraints, profiling data).
3. Decline to modify code until the user supplies the minimum required parameters.

## Evaluation Boundary

This file specifies the expected behavior for a future evaluation runner.
Specification validation confirms the presence and completeness of this test scenario.
Actual agent-behavior evaluation requires an Adamant runner to execute and score the agent's response.
