import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const manifestPath = path.resolve(root, 'evals/manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: evals/manifest.json does not exist');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Signatures to distinguish intended failures from setup errors
const EXPECTED_SIGNATURES = {
  'unit-assertion': {
    match: (out) =>
      out.includes('calculateDiscount applies valid discount correctly') &&
      out.includes('ERR_ASSERTION'),
    description: 'Unit test assertion failure in calculateDiscount (ERR_ASSERTION)'
  },
  'typescript-typecheck': {
    match: (out) =>
      out.includes('error TS2741') &&
      out.includes("'environment'") &&
      out.includes("'ServerConfig'"),
    description: "TypeScript error TS2741: missing 'environment' property in ServerConfig"
  },
  'path-security': {
    match: (out) =>
      out.includes('Missing expected exception (PathTraversalError)') ||
      out.includes('PathTraversalError'),
    description: 'PathTraversalError not thrown when path escapes baseDir'
  },
  'lint-static': {
    match: (out) =>
      out.includes('error TS6133') &&
      out.includes("'unusedCalculationMode'"),
    description: "TS6133 unused variable 'unusedCalculationMode' under --noUnusedLocals"
  },
  'dependency-api': {
    match: (out) =>
      (out.includes('TS2305') || out.includes('TS2724')) &&
      out.includes("'sanitizePath'"),
    description: "Missing exported member 'sanitizePath' from lib/string-utils"
  },
  'logic-defect': {
    match: (out) =>
      out.includes('calculateTotal sums array of numbers correctly') &&
      (out.includes('61 !== 60') || out.includes('ERR_ASSERTION')),
    description: 'Logic defect in calculateTotal (accumulator starting at 1 yielding 61 !== 60)'
  },
  'report-only': {
    match: (out) =>
      out.includes('INFRASTRUCTURE_SECRET_MISSING') &&
      out.includes('VAULT_ENCRYPTION_KEY'),
    description: 'Missing infrastructure secret VAULT_ENCRYPTION_KEY'
  }
};

// Known repairs for proving repairability
function applyKnownRepair(caseId, wt) {
  if (caseId === 'unit-assertion') {
    const calcPath = path.join(wt, 'src/calculator.ts');
    let content = fs.readFileSync(calcPath, 'utf8');
    content = content.replace('(1 + discountPercentage / 100)', '(1 - discountPercentage / 100)');
    fs.writeFileSync(calcPath, content, 'utf8');
  } else if (caseId === 'typescript-typecheck') {
    const configPath = path.join(wt, 'src/config.ts');
    let content = fs.readFileSync(configPath, 'utf8');
    content = content.replace("readonly environment: 'development' | 'production' | 'test'", "readonly environment?: 'development' | 'production' | 'test'");
    fs.writeFileSync(configPath, content, 'utf8');
  } else if (caseId === 'path-security') {
    const guardPath = path.join(wt, 'src/path-guard.ts');
    let content = fs.readFileSync(guardPath, 'utf8');
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const checkSnippet = `  const relative = path.relative(resolvedBase, resolvedTarget)${newline}  if (relative.startsWith('..') || path.isAbsolute(relative)) {${newline}    throw new PathTraversalError('Access denied: Target path escapes base directory')${newline}  }${newline}`;
    content = content.replace('  return resolvedTarget', checkSnippet + '  return resolvedTarget');
    fs.writeFileSync(guardPath, content, 'utf8');
  } else if (caseId === 'lint-static') {
    const calcPath = path.join(wt, 'src/calculator.ts');
    let content = fs.readFileSync(calcPath, 'utf8');
    content = content.replace(/[ \t]*const unusedCalculationMode = 'strict'[^\r\n]*\r?\n?/, '');
    fs.writeFileSync(calcPath, content, 'utf8');
  } else if (caseId === 'dependency-api') {
    const guardPath = path.join(wt, 'src/path-guard.ts');
    let content = fs.readFileSync(guardPath, 'utf8');
    content = content.replace("import { sanitizePath } from '../lib/string-utils/index.ts'", "import { cleanPath } from '../lib/string-utils/index.ts'");
    content = content.replace('const cleaned = sanitizePath(userPath)', 'const cleaned = cleanPath(userPath)');
    fs.writeFileSync(guardPath, content, 'utf8');
  } else if (caseId === 'logic-defect') {
    const calcPath = path.join(wt, 'src/calculator.ts');
    let content = fs.readFileSync(calcPath, 'utf8');
    content = content.replace('.reduce((sum, item) => sum + item, 1)', '.reduce((sum, item) => sum + item, 0)');
    fs.writeFileSync(calcPath, content, 'utf8');
  }
}

function runCommand(command, cwd) {
  try {
    const stdout = cp.execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: 'true' }
    });
    return { exitCode: 0, stdout, stderr: '', combined: stdout };
  } catch (err) {
    const stdout = err.stdout?.toString() ?? '';
    const stderr = err.stderr?.toString() ?? '';
    return {
      exitCode: err.status ?? 1,
      stdout,
      stderr,
      combined: stdout + '\n' + stderr
    };
  }
}

function verifyCase(caseItem, index) {
  const result = {
    id: caseItem.id,
    category: caseItem.category,
    broken_sha: caseItem.broken_sha,
    expected_behavior: caseItem.expected_behavior,
    reproduction_command: caseItem.reproduction_command,
    reproduction_exit_code: null,
    failure_matched_signature: false,
    reproduced_successfully: false,
    fix_verified: false,
    verification_status: 'unverified',
    details: ''
  };

  if (caseItem.expected_behavior === 'give-up') {
    // Give-up case verification
    const specPath = path.resolve(root, 'evals/cases/correct-give-up.md');
    if (!fs.existsSync(specPath)) {
      result.details = 'Specification file evals/cases/correct-give-up.md is missing';
      result.verification_status = 'failed';
      return result;
    }

    const content = fs.readFileSync(specPath, 'utf8');
    const hasScenario = content.includes('## Scenario');
    const hasMissingInfo = content.includes('Missing Information');
    const hasAbstention = content.includes('Required Abstention') || content.includes('give-up');
    const hasExpectedExplanation = content.includes('Expected Explanation');
    const hasBoundary = content.includes('Evaluation Boundary');

    if (hasScenario && hasMissingInfo && hasAbstention && hasExpectedExplanation && hasBoundary) {
      result.reproduction_exit_code = 0;
      result.failure_matched_signature = true;
      result.reproduced_successfully = true;
      result.verification_status = 'specification-only';
      result.details = 'Specification complete. Requires Adamant agent runner for behavioral scoring.';
    } else {
      result.details = 'Specification missing required sections (scenario, abstention, boundary, etc.)';
      result.verification_status = 'failed';
    }
    return result;
  }

  // Isolated worktree setup
  const tmpDirName = `adamant-eval-wt-${caseItem.id}-${Date.now()}-${index}`;
  const wtPath = path.join(os.tmpdir(), tmpDirName);

  try {
    cp.execSync(`git worktree add --detach "${wtPath}" ${caseItem.broken_sha}`, {
      stdio: 'pipe',
      cwd: root
    });

    // Provide node_modules to the worktree safely via junction / symlink
    const rootNodeModules = path.join(root, 'node_modules');
    const wtNodeModules = path.join(wtPath, 'node_modules');

    if (fs.existsSync(rootNodeModules) && !fs.existsSync(wtNodeModules)) {
      try {
        fs.symlinkSync(rootNodeModules, wtNodeModules, os.platform() === 'win32' ? 'junction' : 'dir');
      } catch (err) {
        // Fallback: npm install --ignore-scripts
        cp.execSync('npm install --ignore-scripts --prefer-offline', { cwd: wtPath, stdio: 'pipe' });
      }
    }

    // Step 1: Run reproduction command
    const repRes = runCommand(caseItem.reproduction_command, wtPath);
    result.reproduction_exit_code = repRes.exitCode;

    if (repRes.exitCode === 0) {
      result.details = `Unexpected pass: reproduction command '${caseItem.reproduction_command}' exited with code 0 on broken fixture.`;
      result.verification_status = 'unexpected-pass';
      return result;
    }

    // Step 2: Check failure signature to distinguish intended failures from setup errors
    const sig = EXPECTED_SIGNATURES[caseItem.id];
    if (sig && sig.match(repRes.combined)) {
      result.failure_matched_signature = true;
      result.reproduced_successfully = true;
      result.details = `Confirmed intended failure: ${sig.description}`;
    } else {
      result.failure_matched_signature = false;
      result.details = `Reproduction failed with unexpected output (potential setup or environment issue):\n${repRes.combined.slice(0, 300)}`;
      result.verification_status = 'setup-or-unexpected-error';
      return result;
    }

    // Step 3: Handle behavior-specific verification
    if (caseItem.expected_behavior === 'report-only') {
      result.verification_status = 'runner-pending';
      result.details += ' | Confirmed external infrastructure dependency; behavioral reporting verification is runner-pending.';
      return result;
    }

    if (caseItem.expected_behavior === 'repair') {
      // Test fixability
      applyKnownRepair(caseItem.id, wtPath);
      const fixRes = runCommand(caseItem.fix_verification_command, wtPath);

      if (fixRes.exitCode === 0) {
        result.fix_verified = true;
        result.verification_status = 'verified';
        result.details += ` | Fix verified successfully via '${caseItem.fix_verification_command}'.`;
      } else {
        result.fix_verified = false;
        result.verification_status = 'fix-failed';
        result.details += ` | Fix verification failed with code ${fixRes.exitCode}:\n${fixRes.combined.slice(0, 200)}`;
      }
    }
  } catch (error) {
    result.details = `Execution error: ${error.message}`;
    result.verification_status = 'error';
  } finally {
    // Safe cleanup
    try {
      const wtNodeModules = path.join(wtPath, 'node_modules');
      if (fs.existsSync(wtNodeModules)) {
        fs.unlinkSync(wtNodeModules);
      }
    } catch {}

    try {
      cp.execSync(`git worktree remove --force "${wtPath}"`, { stdio: 'pipe', cwd: root });
    } catch {}

    try {
      cp.execSync('git worktree prune', { stdio: 'pipe', cwd: root });
    } catch {}
  }

  return result;
}

export function runSuite() {
  const timestamp = new Date().toISOString();
  console.log(`Starting Adamant Eval Verification Suite (${manifest.cases.length} cases)...`);
  console.log(`Baseline SHA: ${manifest.baseline_sha}`);
  console.log(`Timestamp: ${timestamp}\n`);

  const results = [];
  let allPassed = true;

  for (const [index, caseItem] of manifest.cases.entries()) {
    process.stdout.write(`[${index + 1}/${manifest.cases.length}] Verifying '${caseItem.id}' (${caseItem.expected_behavior})... `);
    const res = verifyCase(caseItem, index);
    results.push(res);

    if (
      res.verification_status === 'verified' ||
      res.verification_status === 'specification-only' ||
      res.verification_status === 'runner-pending'
    ) {
      console.log(`OK [${res.verification_status}]`);
    } else {
      console.log(`FAILED [${res.verification_status}]`);
      allPassed = false;
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.table(
    results.map((r) => ({
      ID: r.id,
      Category: r.category,
      Behavior: r.expected_behavior,
      Reproduced: r.reproduced_successfully ? 'YES' : 'NO',
      FixVerified: r.fix_verified ? 'YES' : (r.expected_behavior === 'repair' ? 'NO' : 'N/A'),
      Status: r.verification_status
    }))
  );

  return {
    timestamp,
    baseline_sha: manifest.baseline_sha,
    all_passed: allPassed,
    results
  };
}

// CLI entry point
const args = process.argv.slice(2);
const outputFileIndex = args.indexOf('--output');
const outputFile = outputFileIndex !== -1 ? args[outputFileIndex + 1] : null;

const suiteResult = runSuite();

if (outputFile) {
  const outPath = path.resolve(root, outputFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(suiteResult, null, 2), 'utf8');
  console.log(`Results saved to: ${path.relative(root, outPath)}`);
}

if (!suiteResult.all_passed) {
  process.exit(1);
}
