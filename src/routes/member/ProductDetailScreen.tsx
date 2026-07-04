import { useState } from 'react';
import { BottomSheet, Button, Card, Eyebrow, PillarBadge, SparkIcon } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { darken } from '@/utils/pillars';
import { formatAud } from '@/utils/products';

interface Props {
  productId: string;
  onBack: () => void;
}

/**
 * One product, editorially framed: hero, the "recommended because" line, a
 * clear price. Café-order simplicity — the order actions live at the bottom.
 */
export function ProductDetailScreen({ productId, onBack }: Props) {
  const data = useData();
  const product = useStoreState((s) => s.products.find((p) => p.id === productId));
  const [confirmedMethod, setConfirmedMethod] = useState<'cash' | 'points' | null>(null);
  if (!product) return null;

  function order(method: 'cash' | 'points') {
    if (!product) return;
    const placed = data.placeOrder(product.id, method);
    if (placed) setConfirmedMethod(method);
  }

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
        Marketplace
      </button>

      <div
        className="h-[150px] rounded-card shadow-card mb-4"
        style={{
          background: `linear-gradient(135deg, ${product.tint}, ${darken(product.tint, 0.45)})`,
        }}
      />

      <h2 className="font-serif font-semibold text-[23px] leading-tight">{product.name}</h2>
      <div className="flex items-center gap-2 mt-2">
        {product.pillarId && <PillarBadge pillarId={product.pillarId} />}
        <span className="font-serif font-semibold text-[17px]">{formatAud(product.priceAud)}</span>
        {product.pointCost != null && (
          <span className="inline-flex items-center gap-1 text-muted text-[12.5px]">
            · <SparkIcon className="w-3 h-3 text-green" /> {product.pointCost} pts
          </span>
        )}
      </div>
      <p className="text-muted text-[13.5px] leading-relaxed mt-2.5">{product.description}</p>

      <Eyebrow className="mt-5 mb-2">Recommended because</Eyebrow>
      <Card>
        <p className="text-[14px] leading-relaxed">{product.why}</p>
      </Card>

      <Button variant="terra" className="w-full mt-1" onClick={() => order('cash')}>
        Order · {formatAud(product.priceAud)}
      </Button>

      <BottomSheet
        open={confirmedMethod !== null}
        onClose={() => setConfirmedMethod(null)}
        title="Order placed"
        subtitle={product.name}
      >
        <p className="text-[14px] leading-relaxed mb-4">
          We’ll send it to you.{' '}
          {confirmedMethod === 'points'
            ? 'Paid with points — your wallet has been updated.'
            : 'Nothing was charged — orders are mock in this prototype.'}
        </p>
        <Button className="w-full" onClick={() => setConfirmedMethod(null)}>
          Done
        </Button>
      </BottomSheet>
    </section>
  );
}
