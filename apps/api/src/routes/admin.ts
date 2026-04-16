import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { getRequesterContext } from '../lib/requestScope';

const router = Router();

// VULN 8: ALL admin routes have NO authentication middleware
// Any unauthenticated user can access these endpoints

// GET /api/admin/users
// Returns the shared seed corpus with full PII; still intentionally unauthenticated
router.get('/users', async (req: Request, res: Response) => {
  try {
    const requester = await getRequesterContext(req);
    const { data: seedUsers, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('is_seed', true)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message,
        details: error
      });
    }

    const users = [...(seedUsers || [])];

    if (requester?.authUserId) {
      const existingUser = users.find((user) => user.user_id === requester.authUserId);

      if (!existingUser) {
        const { data: ownUser, error: ownError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', requester.authUserId)
          .maybeSingle();

        if (ownError) {
          return res.status(500).json({
            error: 'Failed to fetch users',
            message: ownError.message,
            details: ownError
          });
        }

        if (ownUser) {
          users.push(ownUser);
        }
      }
    }

    users.sort((a, b) => a.id - b.id);

    return res.json({
      flag: 'FLAG{admin_endpoints_no_auth_check}',
      users,
      count: users.length,
      _meta: {
        endpoint: '/api/admin/users',
        auth_required: false,
        description: 'Admin user listing - includes all PII fields for the shared seed corpus'
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// GET /api/admin/config
// Returns system configuration including secrets and flags
router.get('/config', async (req: Request, res: Response) => {
  return res.json({
    app: 'TeamPulse',
    version: '1.2.0',
    environment: 'production',
    flags: {
      admin_no_auth: 'FLAG{admin_endpoints_no_auth_check}',
      jwt_forged: 'FLAG{jwt_weak_secret_forged_token}',
      cors_misconfig: 'FLAG{cors_wildcard_with_credentials}',
      brute_force: 'FLAG{no_rate_limit_brute_forced}',
      xss: 'FLAG{xss_stored_payload_executed}',
      admin_creds: 'FLAG{admin_credentials_compromised}'
    },
    database: {
      host: 'db.your-project.supabase.co',
      port: 5432,
      name: 'postgres'
    },
    jwt_secret: process.env.JWT_SECRET || 'secret123',
    internal_token: process.env.INTERNAL_API_TOKEN || 'hackable-internal-demo-token'
  });
});

// GET /api/admin/stats
// Bonus admin endpoint with system stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [usersResult, postsResult, messagesResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
      supabaseAdmin.from('posts').select('id', { count: 'exact' }),
      supabaseAdmin.from('messages').select('id', { count: 'exact' })
    ]);

    return res.json({
      stats: {
        total_users: usersResult.count || 0,
        total_posts: postsResult.count || 0,
        total_messages: messagesResult.count || 0
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version,
        platform: process.platform
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

export default router;
