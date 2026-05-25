import { useMemo, type ReactNode } from 'react';
import { useStore } from '@/store/memoryStore';
import { createDataService } from './dataService';
import { createAiService } from './aiService';
import { ServicesContext } from '.';

export function ServicesProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  const services = useMemo(() => {
    const data = createDataService(store);
    const ai = createAiService(data);
    return { data, ai };
  }, [store]);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
