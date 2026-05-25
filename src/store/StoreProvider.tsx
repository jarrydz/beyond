import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { MemoryStore, StoreContext, useStore, type StoreState } from './memoryStore';

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => new MemoryStore(), []);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStoreState<T>(selector: (s: StoreState) => T): T {
  const store = useStore();
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(store.get()),
  );
}
