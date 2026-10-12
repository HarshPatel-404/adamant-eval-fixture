/**
 * Calculator utility providing financial and mathematical calculations.
 */

export function calculateTotal(items: readonly number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}

export function calculateDiscount(price: number, discountPercentage: number): number {
  // LINT BUG: Unused local variable triggers error TS6133 under --noUnusedLocals
  const unusedCalculationMode = 'strict'

  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new RangeError('Discount percentage must be between 0 and 100')
  }
  return price * (1 - discountPercentage / 100)
}
