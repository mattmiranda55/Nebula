import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

router.get('/me', (_req: Request, res: Response) => {
  res.json({ message: 'Nebula backend' });
});

// Example stub route where DB calls would be tenant-scoped
router.get('/databases', (_req: Request, res: Response) => {
  // RETURN A SMALL STATIC SAMPLE; replace with real DB access
  res.json({
    databases: [
      { name: 'example_db', tables: ['users', 'orders'] },
    ],
  });
});

export default router;
