import type { Product } from '@/types';
import { darken } from '@/utils/pillars';
import { formatAud } from '@/utils/products';

interface Props {
  product: Product;
  onOpen: (id: string) => void;
}

/**
 * One product as a compact row — café-order simplicity: tint thumb (stands in
 * for photography), name, one blurb line, price. Same visual language as
 * MealCard so the shop reads as part of the app, not a bolt-on.
 */
export function ProductCard({ product, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product.id)}
      className="w-full text-left rounded-card border border-line bg-white shadow-card p-3 mb-2.5 flex items-center gap-3.5 transition active:scale-[0.985] hover:border-sage"
    >
      <div
        className="w-[58px] h-[58px] rounded-[14px] flex-none"
        style={{
          background: `linear-gradient(135deg, ${product.tint}, ${darken(product.tint, 0.45)})`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14.5px] leading-snug">{product.name}</div>
        <div className="text-muted text-[12.5px] mt-0.5 truncate">{product.blurb}</div>
      </div>
      <div className="flex-none font-serif text-[19px] text-ink">
        {formatAud(product.priceAud)}
      </div>
    </button>
  );
}
