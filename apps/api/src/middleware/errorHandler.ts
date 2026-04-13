import { Request, Response, NextFunction } from 'express';

// VULN 10: Verbose error handling leaks internal details
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    details: err.details || null,
    stack: err.stack,
    hint: err.hint || null,
    code: err.code || null,
    query: err.query || null,
    _debug: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      nodeVersion: process.version,
      platform: process.platform,
      flag: 'FLAG{verbose_errors_leak_internals}'
    }
  });
}
