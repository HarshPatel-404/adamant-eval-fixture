# Correct give-up evaluation case

## Scenario

A user asks the agent to optimize a function for speed and memory usage but
provides no performance target, workload, input constraints, or memory limit.

## Expected behavior

give-up: The agent must not make a speculative code change. It should explain
which requirements are missing and ask for the minimum information needed to
choose a justified optimization.

## Evaluation boundary

This file specifies the expected behavior for a future evaluation runner.
It does not claim that an Adamant runner has executed or passed this case.
