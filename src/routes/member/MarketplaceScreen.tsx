import { useMemo } from 'react';
import { Eyebrow, ProductCard } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { productsByCategory } from '@/utils/products';

interface Props {
  onBack: () => void;
  onOpenProduct: (id: string) => void;
}

/**
 * The curated shop — categories, compact tiles, café-order simplicity.
 * Restraint on purpose: few products, editorial framing, no catalogue sprawl.
 */
export function MarketplaceScreen({ onBack, onOpenProduct }: Props) {
  const products = useStoreState((s) => s.products);
  const groups = useMemo(() => productsByCategory(products), [products]);

  return (
    <section className="px-5 pt-3 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-muted text-[13px] font-semibold mb-3 -ml-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        More
      </button>

      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">Marketplace</h2>
      <p className="text-muted text-[13.5px] mb-4">
        Recommended by the retreat — a short list, not a catalogue. Orders are mock for now.
      </p>

      {groups.map((g) => (
        <div key={g.id}>
          <Eyebrow className="mt-4 mb-2">{g.label}</Eyebrow>
          {g.items.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpenProduct} />
          ))}
        </div>
      ))}
    </section>
  );
}
