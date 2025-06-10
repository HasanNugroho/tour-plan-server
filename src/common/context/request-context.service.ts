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

import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestContextService {
	private readonly context = getContext();

	getTenantId(): string | undefined {
		return this.context.tenantId;
	}

	getUserId(): string | undefined {
		return this.context.userId;
	}

	isSuperUser(): boolean {
		return this.context.isSuperUser === true;
	}
}
