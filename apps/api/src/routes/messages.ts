import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middleware/authMiddleware';
import { getRequesterContext } from '../lib/requestScope';

const router = Router();

// GET /api/messages
router.get('/', async (req: Request, res: Response) => {
  try {
    // Intentionally over-broad for the lab: the dashboard hides extra threads in the UI,
    // but direct API access still exposes the full message corpus.
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        recipient_id,
        is_seed,
        created_at,
        sender:sender_id (
          id,
          full_name,
          email
        ),
        recipient:recipient_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch messages',
        message: error.message,
        details: error
      });
    }

    return res.json({
      messages: messages || [],
      count: messages?.length || 0
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// POST /api/messages
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { content, recipient_id } = req.body;
    const requester = await getRequesterContext(req);

    if (!content) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Content is required'
      });
    }

    if (!requester?.profileId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid user session is required'
      });
    }

    if (requester.profileIsSeed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Seed data is read-only'
      });
    }

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        content,
        sender_id: requester.profileId,
        recipient_id: recipient_id || null,
        is_seed: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Failed to create message',
        message: error.message,
        details: error
      });
    }

    return res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// GET /api/messages/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          email
        ),
        recipient:recipient_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({
        error: 'Failed to fetch message',
        message: error.message,
        details: error
      });
    }

    return res.json({ message });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

export default router;
