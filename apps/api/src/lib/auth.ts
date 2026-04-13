import jwt from 'jsonwebtoken';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const JWT_SECRET = getRequiredEnv('JWT_SECRET');

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
