import { Router, Request, Response } from 'express';
import { supabaseClient, supabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middleware/authMiddleware';
import { getRequesterContext } from '../lib/requestScope';

const router = Router();

// GET /api/posts/search
// VULN 4: SQL Injection via unsanitized RPC call
// IMPORTANT: This route must be defined BEFORE /:id to avoid conflicts
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const requester = await getRequesterContext(req);

    if (!q) {
      return res.status(400).json({
        error: 'Missing search query',
        message: 'The "q" query parameter is required',
        example: '/api/posts/search?q=company update'
      });
    }

    // VULN 4: Passes unsanitized input directly to SQL function
    // The Supabase RPC function 'search_posts' uses string concatenation
    // instead of parameterized queries, enabling SQL injection
    const { data, error } = await supabaseClient.rpc('search_posts', {
      search_term: q as string
    });

    if (error) {
      // VULN 10: Error leaks SQL query details
      return res.status(500).json({
        error: 'Search failed',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        query: `SELECT * FROM posts WHERE title ILIKE '%${q}%' OR content ILIKE '%${q}%'`
      });
    }

    const results = (data || []).filter((post: any) => (
      post.is_seed || (
        requester?.profileId !== null &&
        requester?.profileId !== undefined &&
        post.author_id === requester.profileId
      )
    ));

    return res.json({
      results,
      count: results.length,
      query: q
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// GET /api/posts
router.get('/', async (req: Request, res: Response) => {
  try {
    const requester = await getRequesterContext(req);
    let query = supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        author_id,
        category,
        is_seed,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (requester?.profileId) {
      query = query.or(`is_seed.eq.true,author_id.eq.${requester.profileId}`);
    } else {
      query = query.eq('is_seed', true);
    }

    const { data: posts, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch posts',
        message: error.message,
        details: error
      });
    }

    return res.json({
      posts: posts || [],
      count: posts?.length || 0
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// POST /api/posts
// VULN 6: Accepts HTML/script content without sanitization (enables stored XSS)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body;
    const requester = await getRequesterContext(req);

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Title and content are required'
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

    // VULN: No input sanitization - HTML/script tags are stored as-is
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        content,  // Raw HTML/script content stored directly
        author_id: requester.profileId,
        category: category || 'general',
        is_seed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Failed to create post',
        message: error.message,
        details: error
      });
    }

    return res.status(201).json({
      success: true,
      post
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requester = await getRequesterContext(req);

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({
        error: 'Failed to fetch post',
        message: error.message,
        details: error
      });
    }

    if (!post.is_seed && post.author_id !== requester?.profileId) {
      return res.status(404).json({
        error: 'Failed to fetch post',
        message: 'JSON object requested, multiple (or no) rows returned',
        details: null
      });
    }

    return res.json({ post });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: (err as Error).message,
      stack: (err as Error).stack
    });
  }
});

export default router;
