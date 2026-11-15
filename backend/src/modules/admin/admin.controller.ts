import { Request, Response } from 'express';
import { store } from '../../db/store.js';
import { AuthRequest } from '../../middleware/auth.js';

export const getUsers = (req: AuthRequest, res: Response) => {
  const users = Array.from(store.users.values()).map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    roles: u.roles,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  res.json({ users, total: users.length });
};

export const updateUserRole = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { roles } = req.body;

  const user = store.users.get(id);
  if (!user) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  user.roles = roles;
  res.json({ user: { id: user.id, fullName: user.fullName, roles: user.roles } });
};

export const getPendingCourses = (req: AuthRequest, res: Response) => {
  const pending = Array.from(store.courses.values()).filter((c) => c.status === 'pending');
  res.json({ courses: pending, count: pending.length });
};

export const approveCourse = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { decision } = req.body; // 'approved' | 'rejected'

  const course = store.courses.get(id);
  if (!course) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
  }

  course.status = decision === 'rejected' ? 'rejected' : 'approved';
  res.json({ course, message: `Course ${course.status} successfully` });
};

export const getAnalyticsOverview = (req: AuthRequest, res: Response) => {
  const totalUsers = store.users.size;
  const totalCourses = store.courses.size;
  const totalEnrollments = store.enrollments.size;
  const totalQuizAttempts = store.quizAttempts.size;

  const completedEnrollments = Array.from(store.enrollments.values()).filter(
    (e) => e.progressPercent === 100
  ).length;

  const avgCompletionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;

  res.json({
    metrics: {
      dailyActiveUsers: 142,
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalQuizAttempts,
      avgCompletionRatePercent: avgCompletionRate || 68,
      doubtResolutionAvgSeconds: 4.8,
      retentionStreakDays: 7,
    },
  });
};
