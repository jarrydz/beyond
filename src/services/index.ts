import { createContext, useContext } from 'react';
import type { DataService } from './dataService';
import type { AiService } from './aiService';

interface Services {
  data: DataService;
  ai: AiService;
}

export const ServicesContext = createContext<Services | null>(null);

export function useData(): DataService {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useData must be used inside <ServicesProvider>');
  return ctx.data;
}

export function useAi(): AiService {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useAi must be used inside <ServicesProvider>');
  return ctx.ai;
}

export type { DataService, AiService };
