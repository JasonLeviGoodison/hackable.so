import { Request } from 'express';
import { verifyToken } from './auth';
import { supabaseAdmin } from './supabase';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export interface RequesterContext {
  authUserId: string;
  email: string;
  role: string;
  profileId: number | null;
  profileIsSeed: boolean;
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  return authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
}

export async function getRequesterContext(req: Request): Promise<RequesterContext | null> {
  const token = getBearerToken(req);

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, is_seed')
      .eq('user_id', decoded.userId)
      .maybeSingle();

    return {
      authUserId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      profileId: profile?.id ?? null,
      profileIsSeed: Boolean(profile?.is_seed)
    };
  } catch {
    return null;
  }
}
