import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many auth requests, please try again later' } },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please slow down' } },
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root API Welcome / Info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Vertexon LMS-AI Core Service API',
    version: 'v1.0',
    documentation: '/docs',
    status: 'online',
  });
});

// Module routers (stubbed / extensible)
const apiRouter = express.Router();
apiRouter.use(generalLimiter);

// Auth stub
apiRouter.post('/auth/login', authLimiter, (req, res) => {
  res.json({
    message: 'Login endpoint stub - ready for implementation',
    sample_request: { email: 'ananya@example.com', password: 'SecurePass123' },
  });
});

apiRouter.get('/courses', (req, res) => {
  res.json({
    courses: [],
    total: 0,
    page: 1,
    limit: 10,
  });
});

app.use('/api/v1', apiRouter);

// Centralized error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 LMS Core Backend Service running on port ${config.port}`);
    console.log(`📡 Base API endpoint: http://localhost:${config.port}/api/v1`);
  });
}

export default app;
