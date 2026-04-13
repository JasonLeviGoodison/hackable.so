import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /api/users
// Returns list of all users (basic info)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, department, avatar_url, created_at')
      .order('id', { ascending: true });

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message,
        details: error,
        hint: error.hint,
        code: error.code
      });
    }

    return res.json({
      users,
      count: users?.length || 0
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
