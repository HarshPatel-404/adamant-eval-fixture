import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { resolveSafePath, PathTraversalError } from '../src/path-guard.ts'

test('resolveSafePath allows valid paths within sandbox', () => {
  const base = path.resolve('/workspace/app')
  const safe = resolveSafePath(base, 'logs/today.log')
  assert.equal(safe, path.join(base, 'logs', 'today.log'))
})

test('resolveSafePath rejects parent directory traversal attempts', () => {
  const base = path.resolve('/workspace/app')
  assert.throws(
    () => resolveSafePath(base, '../etc/passwd'),
    PathTraversalError
  )
})

test('resolveSafePath rejects absolute path escapes', () => {
  const base = path.resolve('/workspace/app')
  assert.throws(
    () => resolveSafePath(base, '/etc/shadow'),
    PathTraversalError
  )
})
