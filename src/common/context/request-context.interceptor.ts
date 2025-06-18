import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from './request-context.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();

		return RequestContext.run(
			{
				userId: request.user?.id,
				tenantId: request.user?.tenantId,
				isSuperUser: request.user?.role?.name.toLowerCase() === 'superadmin',
			},
			() => next.handle(),
		);
	}
}
