import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  field?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[Error] ${code}: ${err.message}`, err.stack);

  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'An unexpected error occurred.',
      ...(err.field ? { field: err.field } : {}),
    },
  });
};
