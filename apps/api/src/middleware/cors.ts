import cors from 'cors';

// VULN 11: CORS misconfiguration
// origin: true reflects any Origin header back as Access-Control-Allow-Origin
// combined with credentials: true, this allows any site to make authenticated requests
export const corsMiddleware = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
});
