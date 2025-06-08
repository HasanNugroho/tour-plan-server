import { AsyncLocalStorage } from 'async_hooks';

interface ContextData {
  tenantId?: string;
  userId?: string;
  isSuperUser?: boolean;
}

export const RequestContext = new AsyncLocalStorage<ContextData>();

export function getContext(): ContextData {
  return RequestContext.getStore() || {};
}
