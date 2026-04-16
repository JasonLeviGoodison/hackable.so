import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { getRequesterContext } from '../lib/requestScope';

const router = Router();

// GET /api/users
// Returns the shared seed directory plus the requesting user's own profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const requester = await getRequesterContext(req);
    const { data: seedUsers, error: seedError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, department, avatar_url, created_at, user_id, is_seed')
      .eq('is_seed', true)
      .order('id', { ascending: true });

    if (seedError) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        message: seedError.message,
        details: seedError,
        hint: seedError.hint,
        code: seedError.code
      });
    }

    const users = [...(seedUsers || [])];

    if (requester?.authUserId) {
      const existingUser = users.find((user) => user.user_id === requester.authUserId);

      if (!existingUser) {
        const { data: ownUser, error: ownError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, full_name, role, department, avatar_url, created_at, user_id, is_seed')
          .eq('user_id', requester.authUserId)
          .maybeSingle();

        if (ownError) {
          return res.status(500).json({
            error: 'Failed to fetch users',
            message: ownError.message,
            details: ownError,
            hint: ownError.hint,
            code: ownError.code
          });
        }

        if (ownUser) {
          users.push(ownUser);
        }
      }
    }

    users.sort((a, b) => a.id - b.id);

    return res.json({
      users: users.map(({ user_id, is_seed, ...user }) => user),
      count: users.length
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// GET /api/users/:id
// VULN 3: IDOR - No auth check, returns full profile with sensitive data
// Uses sequential integer IDs that are easily guessable
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requester = await getRequesterContext(req);

    // VULN: No authentication or authorization check
    // Any user (or unauthenticated request) can access any user's full profile

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')  // VULN: Selects ALL fields including sensitive PII
      .eq('id', id)
      .single();

    if (error) {
      // VULN 10: Error leaks database schema information
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({
        error: 'Failed to fetch user',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        query: `SELECT * FROM profiles WHERE id = '${id}'`  // VULN: Leaks query
      });
    }

    if (!user.is_seed && user.user_id !== requester?.authUserId) {
      return res.status(404).json({
        error: 'Failed to fetch user',
        message: `JSON object requested, no rows returned for id '${id}'`,
        details: null,
        hint: null,
        code: 'PGRST116',
        query: `SELECT * FROM profiles WHERE id = '${id}'`
      });
    }

    // VULN: Returns all sensitive fields - SSN, salary, phone, notes
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar_url: user.avatar_url,
        ssn_last_four: user.ssn_last_four,
        salary: user.salary,
        notes: user.notes,
        emergency_contact: user.emergency_contact,
        address: user.address,
        date_of_birth: user.date_of_birth,
        hire_date: user.hire_date,
        is_seed: user.is_seed,
        created_at: user.created_at,
        updated_at: user.updated_at
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
