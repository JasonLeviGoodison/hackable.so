import { Router, Request, Response } from 'express';
import { supabaseClient, supabaseAdmin } from '../lib/supabase';
import { signToken } from '../lib/auth';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
// VULN 5: No rate limiting - allows brute force attacks
// VULN 9: Detailed error messages reveal user existence
// VULN 12: Uses weak JWT secret
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Both email and password are required'
      });
    }

    // Attempt sign in via Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // VULN 9: Verbose error messages leak whether user exists
      if (authError.message.includes('Invalid login credentials')) {
        // Check if user exists to give more specific error
        const { data: existingUser } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single();

        if (existingUser) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: `Invalid password for user ${email}`,
            hint: 'The email exists but the password is incorrect'
          });
        } else {
          return res.status(401).json({
            error: 'Authentication failed',
            message: `No account found with email ${email}`,
            hint: 'This email is not registered'
          });
        }
      }

      return res.status(401).json({
        error: 'Authentication failed',
        message: authError.message,
        details: authError
      });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({
        error: 'Profile fetch failed',
        message: profileError.message,
        details: profileError
      });
    }

    // VULN 12: Sign custom JWT with weak secret
    const token = signToken({
      userId: authData.user.id,
      email: authData.user.email,
      role: profile?.role || 'employee',
      full_name: profile?.full_name
    });

    return res.json({
      success: true,
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name,
        role: profile?.role || 'employee',
        avatar_url: profile?.avatar_url
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

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email and password are required'
      });
    }

    // Create user via service role so the lab can use throwaway fake addresses.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || normalizedEmail.split('@')[0]
      }
    });

    if (authError) {
      return res.status(400).json({
        error: 'Registration failed',
        message: authError.message,
        details: authError
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'User creation returned no user object'
      });
    }

    // Create profile in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: normalizedEmail,
        full_name: full_name || normalizedEmail.split('@')[0],
        role: 'employee',
        department: 'Unassigned',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      return res.status(500).json({
        error: 'Profile creation failed',
        message: profileError.message,
        details: profileError
      });
    }

    // Sign JWT
    const token = signToken({
      userId: authData.user.id,
      email: normalizedEmail,
      role: 'employee',
      full_name: full_name || normalizedEmail.split('@')[0]
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: authData.user.id,
        email: normalizedEmail,
        full_name: profile?.full_name,
        role: 'employee'
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

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', req.user!.userId)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Profile not found',
        message: error.message,
        details: error
      });
    }

    return res.json({
      user: profile
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
