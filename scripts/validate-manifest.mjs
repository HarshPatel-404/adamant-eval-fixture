import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('evals/manifest.json');
const root = process.cwd();

let hasError = false;

function fail(message) {
  console.error(`INVALID: ${message}`);
  hasError = true;
  process.exitCode = 1;
}

if (!fs.existsSync(manifestPath)) {
  fail('Missing evals/manifest.json');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  fail(`Invalid JSON syntax in evals/manifest.json: ${error.message}`);
  process.exit(1);
}

if (manifest.schema_version !== '1.0.0') {
  fail("schema_version must be '1.0.0'");
}

if (!/^[0-9a-f]{40}$/.test(manifest.baseline_sha ?? '')) {
  fail('baseline_sha must be a full lowercase 40-character SHA');
}

if (!manifest.runtime || typeof manifest.runtime !== 'object') {
  fail('runtime configuration object is required');
} else {
  if (typeof manifest.runtime.node !== 'string' || !manifest.runtime.node.trim()) {
    fail('runtime.node must be a non-empty string');
  }
  if (typeof manifest.runtime.package_manager !== 'string' || !manifest.runtime.package_manager.trim()) {
    fail('runtime.package_manager must be a non-empty string');
  }
}

if (!Array.isArray(manifest.cases)) {
  fail('cases must be an array');
  process.exit(1);
}

if (manifest.cases.length < 8) {
  fail(`At least eight cases are required, found ${manifest.cases.length}`);
}

const allowedBehaviors = new Set(['repair', 'report-only', 'give-up']);
const allowedVerificationStatuses = new Set([
  'verified',
  'reproduced',
  'specification-only',
  'runner-pending',
  'pending'
]);

const ids = new Set();
const shas = new Set();

for (const [index, item] of manifest.cases.entries()) {
  if (!item || typeof item !== 'object') {
    fail(`Case at index ${index} must be an object`);
    continue;
  }

  const caseId = item.id;
  if (!caseId || typeof caseId !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(caseId)) {
    fail(`Invalid case ID at index ${index}: '${caseId}' (must match ^[a-z0-9][a-z0-9-]*$)`);
  } else if (ids.has(caseId)) {
    fail(`Duplicate case ID: '${caseId}'`);
  } else {
    ids.add(caseId);
  }

  for (const field of ['category', 'reproduction_command', 'expected_behavior']) {
    if (typeof item[field] !== 'string' || !item[field].trim()) {
      fail(`${caseId}: required field '${field}' must be a non-empty string`);
    }
  }

  if (!allowedBehaviors.has(item.expected_behavior)) {
    fail(
      `${caseId}: invalid expected_behavior '${item.expected_behavior}'. Allowed: ${Array.from(allowedBehaviors).join(', ')}`
    );
  }

  if (typeof item.verification_status !== 'string' || !allowedVerificationStatuses.has(item.verification_status)) {
    fail(
      `${caseId}: invalid verification_status '${item.verification_status}'. Allowed: ${Array.from(allowedVerificationStatuses).join(', ')}`
    );
  }

  if (!/^[0-9a-f]{40}$/.test(item.broken_sha ?? '')) {
    fail(`${caseId}: broken_sha must be a full lowercase 40-character SHA`);
  } else if (shas.has(item.broken_sha)) {
    fail(`${caseId}: duplicate broken SHA '${item.broken_sha}'`);
  } else {
    shas.add(item.broken_sha);
  }

  if (!Array.isArray(item.evidence_files)) {
    fail(`${caseId}: evidence_files must be an array`);
  } else if (item.evidence_files.length === 0) {
    fail(`${caseId}: evidence_files must contain at least one evidence file reference`);
  } else {
    for (const relative of item.evidence_files) {
      if (
        typeof relative !== 'string' ||
        path.isAbsolute(relative) ||
        relative.split(/[\\/]/).includes('..')
      ) {
        fail(`${caseId}: unsafe evidence path '${relative}'`);
        continue;
      }

      const resolved = path.resolve(root, relative);
      if (!fs.existsSync(resolved)) {
        fail(`${caseId}: evidence file does not exist on disk: '${relative}'`);
      }
    }
  }

  if (item.expected_behavior === 'repair') {
    if (
      typeof item.fix_verification_command !== 'string' ||
      !item.fix_verification_command.trim()
    ) {
      fail(`${caseId}: repair cases require a non-empty fix_verification_command`);
    }
  } else {
    if (item.fix_verification_command !== null && item.fix_verification_command !== undefined) {
      fail(`${caseId}: ${item.expected_behavior} cases must have null or omitted fix_verification_command`);
    }
  }
}

if (hasError) {
  console.error('Manifest validation failed with errors.');
  process.exit(1);
} else {
  console.log(`Manifest validation succeeded: ${manifest.cases.length} cases verified.`);
}
