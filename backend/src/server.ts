import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken, requireRole } from './middleware/auth.js';

// Controllers
import * as authCtrl from './modules/auth/auth.controller.js';
import * as courseCtrl from './modules/courses/courses.controller.js';
import * as enrollCtrl from './modules/enrollments/enrollments.controller.js';
import * as quizCtrl from './modules/quizzes/quizzes.controller.js';
import * as aiCtrl from './modules/ai/ai.controller.js';
import * as adminCtrl from './modules/admin/admin.controller.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many auth attempts, please try again in a minute' } },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
});

// Base API Router
const api = express.Router();
api.use(apiLimiter);

// 1. Health & Meta
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lms-backend', timestamp: new Date().toISOString() });
});

api.get('/', (req, res) => {
  res.json({
    name: 'Vertexon LMS-AI Core Service API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/v1/auth',
      courses: '/api/v1/courses',
      enrollments: '/api/v1/enrollments',
      quizzes: '/api/v1/quizzes',
      ai: '/api/v1/ai',
      admin: '/api/v1/admin',
    },
  });
});

// 2. Auth Routes
api.post('/auth/register', authLimiter, authCtrl.register);
api.post('/auth/login', authLimiter, authCtrl.login);
api.get('/auth/me', authenticateToken, authCtrl.getMe);

// 3. Courses Routes (Public & Instructor)
api.get('/courses', courseCtrl.getCourses);
api.get('/courses/:id', courseCtrl.getCourseById);
api.post('/courses', authenticateToken, requireRole('instructor', 'admin'), courseCtrl.createCourse);
api.post('/courses/:id/modules', authenticateToken, requireRole('instructor', 'admin'), courseCtrl.addModule);
api.post('/modules/:moduleId/lectures', authenticateToken, requireRole('instructor', 'admin'), courseCtrl.addLecture);

// 4. Enrollments & Progress Routes (Student)
api.post('/courses/:id/enroll', authenticateToken, enrollCtrl.enrollInCourse);
api.get('/enrollments/me', authenticateToken, enrollCtrl.getMyEnrollments);
api.post('/lectures/:id/progress', authenticateToken, enrollCtrl.updateLectureProgress);
api.post('/lectures/:id/notes', authenticateToken, enrollCtrl.addNote);
api.get('/lectures/:id/notes', authenticateToken, enrollCtrl.getNotes);
api.get('/certificates/:id', authenticateToken, enrollCtrl.getCertificate);

// 5. Quizzes Routes
api.get('/quizzes/:id', quizCtrl.getQuizById);
api.post('/quizzes/:id/submit', authenticateToken, quizCtrl.submitQuizAttempt);

// 6. AI Tutor Routes (RAG, Summaries, Quiz Gen)
api.post('/ai/chat/sessions', authenticateToken, aiCtrl.createChatSession);
api.post('/ai/chat/sessions/:id/messages', authenticateToken, aiCtrl.sendChatMessage);
api.post('/ai/lectures/:id/summarize', authenticateToken, aiCtrl.summarizeLecture);
api.post('/ai/lectures/:id/generate-quiz', authenticateToken, requireRole('instructor', 'admin'), aiCtrl.generateQuizFromTranscript);
api.get('/ai/study-plan', authenticateToken, aiCtrl.getStudyPlan);

// 7. Admin Routes
api.get('/admin/users', authenticateToken, requireRole('admin'), adminCtrl.getUsers);
api.put('/admin/users/:id/role', authenticateToken, requireRole('admin'), adminCtrl.updateUserRole);
api.get('/admin/courses/pending', authenticateToken, requireRole('admin'), adminCtrl.getPendingCourses);
api.post('/admin/courses/:id/approve', authenticateToken, requireRole('admin'), adminCtrl.approveCourse);
api.get('/admin/analytics/overview', authenticateToken, requireRole('admin'), adminCtrl.getAnalyticsOverview);

// Mount API
app.use('/api/v1', api);

// Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 LMS Core Backend Service running on port ${config.port}`);
    console.log(`📡 Base API endpoint: http://localhost:${config.port}/api/v1`);
  });
}

export default app;
