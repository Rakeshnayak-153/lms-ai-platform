import { Request, Response } from 'express';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import { store, Course, Module, Lecture } from '../../db/store.js';
import { AuthRequest } from '../../middleware/auth.js';

export const getCourses = (req: Request, res: Response) => {
  const { category, difficulty, q } = req.query;

  let courses = Array.from(store.courses.values()).filter((c) => c.status === 'approved');

  if (category && typeof category === 'string' && category !== 'All') {
    courses = courses.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
    courses = courses.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }

  res.json({
    courses,
    total: courses.length,
  });
};

export const getCourseById = (req: Request, res: Response) => {
  const { id } = req.params;
  const course = store.courses.get(id);

  if (!course) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
  }

  res.json({ course });
};

export const createCourse = (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, difficulty, thumbnailUrl, price } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Title, description, and category are required' },
      });
    }

    const newCourse: Course = {
      id: uuidv4(),
      instructorId: req.user?.id || 'instructor-uuid-1',
      title,
      description,
      category,
      difficulty: difficulty || 'beginner',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
      price: price || 0,
      status: 'approved', // Auto-approved for fast developer demo
      modules: [],
      createdAt: new Date().toISOString(),
    };

    store.courses.set(newCourse.id, newCourse);

    res.status(201).json({ course: newCourse });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const addModule = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // courseId
  const { title } = req.body;

  const course = store.courses.get(id);
  if (!course) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });
  }

  const newModule: Module = {
    id: uuidv4(),
    courseId: id,
    title,
    orderIndex: course.modules.length + 1,
    lectures: [],
    quizzes: [],
  };

  course.modules.push(newModule);
  res.status(201).json({ module: newModule });
};

export const addLecture = (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;
  const { title, videoUrl, transcript, durationSeconds, resourceUrls } = req.body;

  let targetCourse: Course | undefined;
  let targetModule: Module | undefined;

  for (const c of store.courses.values()) {
    const m = c.modules.find((mod) => mod.id === moduleId);
    if (m) {
      targetCourse = c;
      targetModule = m;
      break;
    }
  }

  if (!targetModule || !targetCourse) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Module not found' } });
  }

  const newLecture: Lecture = {
    id: uuidv4(),
    moduleId,
    title,
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcript: transcript || '',
    durationSeconds: durationSeconds || 600,
    orderIndex: targetModule.lectures.length + 1,
    resourceUrls: resourceUrls || [],
  };

  targetModule.lectures.push(newLecture);

  // If transcript provided, automatically chunk it for RAG
  if (transcript && transcript.length > 50) {
    store.documentChunks.push({
      id: uuidv4(),
      courseId: targetCourse.id,
      lectureId: newLecture.id,
      chunkText: transcript,
      embedding: [0.2, 0.3, 0.4],
    });
  }

  res.status(201).json({ lecture: newLecture });
};
