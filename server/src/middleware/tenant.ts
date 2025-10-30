import type { Request, Response, NextFunction } from 'express';

// Simple multi-tenant middleware example.
// It looks for a tenant id in the `x-tenant-id` header or `tenant` query param.
// Attaches a `tenant` object to `req` for downstream handlers.

export interface TenantInfo {
  id: string;
  name?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: TenantInfo;
  }
}

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('x-tenant-id');
  const q = req.query.tenant;
  const tenantId = (typeof q === 'string' && q) || header || 'public';

  // In a real app, you'd validate tenantId and load tenant config from a DB or config store.
  req.tenant = { id: tenantId, name: `Tenant ${tenantId}` };
  next();
}

export default tenantMiddleware;
