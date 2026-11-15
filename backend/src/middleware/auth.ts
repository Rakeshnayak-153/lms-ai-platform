import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required in Authorization header',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired',
      },
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
};
