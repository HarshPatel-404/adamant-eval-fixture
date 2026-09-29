/**
 * Calculator utility providing financial and mathematical calculations.
 */

export function calculateTotal(items: readonly number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}

export function calculateDiscount(price: number, discountPercentage: number): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new RangeError('Discount percentage must be between 0 and 100')
  }
  // BUG: Inverted calculation adds discount percentage instead of subtracting it
  return price * (1 + discountPercentage / 100)
}
