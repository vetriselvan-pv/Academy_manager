import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { AccessTokenPayload, RefreshTokenPayload, UserRole } from '../types';
import { UnauthorizedError } from './errors';

export function signAccessToken(userId: string, role: UserRole): string {
  const payload: AccessTokenPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID();
  const payload: RefreshTokenPayload = { sub: userId, jti };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
