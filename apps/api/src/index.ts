import express from 'express';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load env from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { assertReleaseSafeRuntime } from './lib/releaseGuard';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import messagesRoutes from './routes/messages';
import adminRoutes from './routes/admin';

assertReleaseSafeRuntime();

const app = express();
const PORT = process.env.PORT || 4000;

// Logging
app.use(morgan('combined'));

// CORS - VULN 11: Wildcard origin with credentials
app.use(corsMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VULN: Serve static files from project root with dotfiles allowed
// This exposes .env, .git/, and other sensitive files via HTTP
app.use(express.static(path.join(__dirname, '..'), { dotfiles: 'allow' }));

// Serve public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TeamPulse API',
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});

// VULN: Debug endpoint exposes all environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    environment: process.env,
    flag: 'FLAG{debug_endpoint_leaks_env_vars}'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/users',
      '/api/users/:id',
      '/api/posts',
      '/api/posts/search',
      '/api/messages',
      '/api/admin/users',
      '/api/admin/config',
      '/debug/env'
    ]
  });
});

// VULN 10: Verbose error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TeamPulse API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Deployment mode: ${process.env.HACKABLE_DEPLOYMENT_MODE || 'single-tenant'}`);
});

export default app;
