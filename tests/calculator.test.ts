import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateTotal, calculateDiscount } from '../src/calculator.ts'

test('calculateTotal sums array of numbers correctly', () => {
  assert.equal(calculateTotal([10, 20, 30]), 60)
  assert.equal(calculateTotal([]), 0)
})

test('calculateDiscount applies valid discount correctly', () => {
  assert.equal(calculateDiscount(100, 20), 80)
  assert.equal(calculateDiscount(50, 10), 45)
  assert.equal(calculateDiscount(200, 0), 200)
})

test('calculateDiscount throws on invalid discount percentages', () => {
  assert.throws(() => calculateDiscount(100, -5), RangeError)
  assert.throws(() => calculateDiscount(100, 105), RangeError)
})
