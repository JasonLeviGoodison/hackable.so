import { Router, Request, Response } from 'express';
import { supabaseClient, supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /api/posts/search
// VULN 4: SQL Injection via unsanitized RPC call
// IMPORTANT: This route must be defined BEFORE /:id to avoid conflicts
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

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

    return res.json({
      results: data || [],
      count: data?.length || 0,
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
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        author_id,
        category,
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, author_id, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Title and content are required'
      });
    }

    // VULN: No input sanitization - HTML/script tags are stored as-is
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        content,  // Raw HTML/script content stored directly
        author_id: author_id || null,
        category: category || 'general',
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
