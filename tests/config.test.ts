import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultServerConfig, parsePort } from '../src/config.ts'

test('defaultServerConfig provides valid configuration defaults', () => {
  assert.equal(defaultServerConfig.host, '127.0.0.1')
  assert.equal(defaultServerConfig.port, 8080)
  assert.equal(defaultServerConfig.timeoutMs, 5000)
})

test('parsePort parses valid port numbers or falls back to default', () => {
  assert.equal(parsePort('3000'), 3000)
  assert.equal(parsePort(undefined), 8080)
})

test('parsePort rejects invalid port strings', () => {
  assert.throws(() => parsePort('abc'), /Invalid port/)
  assert.throws(() => parsePort('99999'), /Invalid port/)
})
