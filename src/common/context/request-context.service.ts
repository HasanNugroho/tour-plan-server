import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

interface ContextData {
	tenantId?: string;
	userId?: string;
	isSuperUser?: boolean;
}

export const RequestContext = new AsyncLocalStorage<ContextData>();

@Injectable()
export class RequestContextService {
	getContext() {
		return RequestContext.getStore() || {};
	}

	getTenantId(): string | undefined {
		return this.getContext().tenantId;
	}

	getUserId(): string | undefined {
		return this.getContext().userId;
	}

	isSuperUser(): boolean {
		return this.getContext().isSuperUser === true;
	}
}