import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export function generateToken(payload: TokenPayload): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
}

export function verifyToken(token: string): TokenPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
}