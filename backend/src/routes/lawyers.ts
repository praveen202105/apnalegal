/**
 * /lawyers route — Public lawyer browsing is DISABLED.
 * Users submit consultation requests via /consultations instead.
 * Admin manages lawyers via /admin/lawyers.
 */
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(410).json({
    message: 'Direct lawyer browsing is no longer available. Please submit a consultation request and our team will match you with the right lawyer.',
    action: 'POST /consultations',
  });
});

router.all('*', (_req: Request, res: Response) => {
  res.status(410).json({ message: 'This endpoint has been deprecated.' });
});

export default router;
