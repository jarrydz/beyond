import { useSyncExternalStore } from 'react';
import { useStore, type StoreState } from './memoryStore';

export function useStoreState<T>(selector: (s: StoreState) => T): T {
  const store = useStore();
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(store.get()),
  );
}
