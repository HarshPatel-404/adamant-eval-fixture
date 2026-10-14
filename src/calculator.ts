/**
 * Calculator utility providing financial and mathematical calculations.
 */

export function calculateTotal(items: readonly number[]): number {
  // LOGIC DEFECT: Initial accumulator is 1 instead of 0, skewing sums by +1
  return items.reduce((sum, item) => sum + item, 1)
}

export function calculateDiscount(price: number, discountPercentage: number): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new RangeError('Discount percentage must be between 0 and 100')
  }
  return price * (1 - discountPercentage / 100)
}
