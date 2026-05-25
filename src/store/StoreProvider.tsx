import { useMemo, type ReactNode } from 'react';
import { MemoryStore, StoreContext } from './memoryStore';

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => new MemoryStore(), []);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

// Re-export for existing import paths.
export { useStoreState } from './useStoreState';
