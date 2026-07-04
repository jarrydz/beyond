import type { Product, ProductCategory } from '@/types';

/** Display order + labels for the marketplace categories. Key off id, never the label. */
export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'box', label: 'Boxes' },
  { id: 'supplement', label: 'Supplements' },
  { id: 'book', label: 'Books' },
  { id: 'drink', label: 'Drinks' },
];

/** Products grouped by category, in PRODUCT_CATEGORIES order. Empty categories are kept out. */
export function productsByCategory(
  products: Product[],
): { id: ProductCategory; label: string; items: Product[] }[] {
  return PRODUCT_CATEGORIES.map((c) => ({
    ...c,
    items: products.filter((p) => p.category === c.id),
  })).filter((g) => g.items.length > 0);
}

/** "$6.50" / "$42" — drop cents only when they're zero. */
export function formatAud(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}
