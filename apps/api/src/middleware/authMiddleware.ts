import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

// Auth middleware - checks JWT from Authorization header
// VULN: This middleware exists but is NOT applied to admin routes
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No authorization token provided'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      details: err.message // VULN: Leaks JWT verification error details
    });
  }
}
