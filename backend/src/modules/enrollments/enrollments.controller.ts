import { Response } from 'express';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import { store, Enrollment, Note, Bookmark } from '../../db/store.js';
import { AuthRequest } from '../../middleware/auth.js';

export const enrollInCourse = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // courseId
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const course = store.courses.get(id);
  if (!course) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
  }

  const enrollmentKey = `${userId}_${id}`;
  if (store.enrollments.has(enrollmentKey)) {
    return res.json({ enrollment: store.enrollments.get(enrollmentKey), message: 'Already enrolled' });
  }

  const newEnrollment: Enrollment = {
    id: uuidv4(),
    userId,
    courseId: id,
    enrolledAt: new Date().toISOString(),
    progressPercent: 0,
    completedLectures: [],
    watchedSeconds: {},
    certificateIssued: false,
  };

  store.enrollments.set(enrollmentKey, newEnrollment);
  res.status(201).json({ enrollment: newEnrollment });
};

export const getMyEnrollments = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const enrollments = Array.from(store.enrollments.values()).filter((e) => e.userId === userId);
  const enrolledCourses = enrollments.map((enr) => {
    const course = store.courses.get(enr.courseId);
    return {
      enrollment: enr,
      course,
    };
  });

  res.json({ enrollments: enrolledCourses });
};

export const updateLectureProgress = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // lectureId
  const { courseId, watchedSeconds, completed } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const enrollmentKey = `${userId}_${courseId}`;
  let enrollment = store.enrollments.get(enrollmentKey);

  if (!enrollment) {
    // Auto-enroll if not enrolled
    enrollment = {
      id: uuidv4(),
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progressPercent: 0,
      completedLectures: [],
      watchedSeconds: {},
      certificateIssued: false,
    };
    store.enrollments.set(enrollmentKey, enrollment);
  }

  enrollment.watchedSeconds[id] = watchedSeconds;

  if (completed && !enrollment.completedLectures.includes(id)) {
    enrollment.completedLectures.push(id);
  }

  // Calculate course total lectures
  const course = store.courses.get(courseId);
  if (course) {
    let totalLectures = 0;
    course.modules.forEach((m) => (totalLectures += m.lectures.length));

    if (totalLectures > 0) {
      enrollment.progressPercent = Math.min(
        100,
        Math.round((enrollment.completedLectures.length / totalLectures) * 100)
      );

      if (enrollment.progressPercent === 100) {
        enrollment.certificateIssued = true;
        enrollment.certificateUrl = `/certificates/verify/${enrollment.id}`;
      }
    }
  }

  res.json({ enrollment });
};

export const addNote = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // lectureId
  const { timestampSeconds, content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const newNote: Note = {
    id: uuidv4(),
    userId,
    lectureId: id,
    timestampSeconds: timestampSeconds || 0,
    content,
    createdAt: new Date().toISOString(),
  };

  store.notes.set(newNote.id, newNote);
  res.status(201).json({ note: newNote });
};

export const getNotes = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // lectureId
  const userId = req.user?.id;

  const notes = Array.from(store.notes.values()).filter(
    (n) => n.userId === userId && n.lectureId === id
  );

  res.json({ notes });
};

export const getCertificate = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // enrollmentId or courseId
  const userId = req.user?.id;

  const enrollment = Array.from(store.enrollments.values()).find(
    (e) => (e.id === id || e.courseId === id) && e.userId === userId
  );

  if (!enrollment || enrollment.progressPercent < 100) {
    return res.status(400).json({
      error: { code: 'NOT_ELIGIBLE', message: 'Course must be 100% completed to issue a certificate' },
    });
  }

  const course = store.courses.get(enrollment.courseId);
  const user = store.users.get(userId!);

  res.json({
    certificate: {
      certificateNumber: `VRTX-${enrollment.id.substring(0, 8).toUpperCase()}-2026`,
      studentName: user?.fullName || 'Enrolled Student',
      courseTitle: course?.title || 'Advanced Masterclass',
      issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationUrl: `https://vertexon.learning/verify/${enrollment.id}`,
    },
  });
};
