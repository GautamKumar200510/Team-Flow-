import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from './db.js';
import { User } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'teamflow-super-secret-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No valid Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload || !payload.id) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  const user = dbService.getUserById(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found or account deactivated.' });
  }

  req.user = user;
  next();
}
