import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../context/request-context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const user = req['user'];

    const context = {
      tenantId: user?.tenantId ?? null,
      userId: user?.id ?? null,
      isSuperUser: (user?.role?.name || '').toUpperCase() === 'SUPERADMIN',
    };

    RequestContext.run(context, () => next());
  }
}
