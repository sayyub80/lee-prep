import jwt, { SignOptions } from 'jsonwebtoken';

type TokenPayload = {
  [key: string]: any;
};

export function generateToken(payload: TokenPayload): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn']
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as TokenPayload;
}