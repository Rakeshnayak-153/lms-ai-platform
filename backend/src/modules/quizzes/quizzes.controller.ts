import { Request, Response } from 'express';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import { store, Quiz, QuizAttempt } from '../../db/store.js';
import { AuthRequest } from '../../middleware/auth.js';

export const getQuizById = (req: Request, res: Response) => {
  const { id } = req.params;

  let foundQuiz: Quiz | undefined;
  for (const course of store.courses.values()) {
    for (const mod of course.modules) {
      const q = mod.quizzes.find((quiz) => quiz.id === id);
      if (q) {
        foundQuiz = q;
        break;
      }
    }
    if (foundQuiz) break;
  }

  if (!foundQuiz) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quiz not found' } });
  }

  // Sanitize isCorrect so students cannot inspect correct answers before submitting
  const sanitizedQuestions = foundQuiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    questionType: q.questionType,
    orderIndex: q.orderIndex,
    options: q.options.map((opt) => ({
      id: opt.id,
      optionText: opt.optionText,
    })),
  }));

  res.json({
    quiz: {
      id: foundQuiz.id,
      title: foundQuiz.title,
      isAiGenerated: foundQuiz.isAiGenerated,
      questions: sanitizedQuestions,
    },
  });
};

export const submitQuizAttempt = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // quizId
  const { answers } = req.body; // array of { questionId, selectedOptionIds }
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  let foundQuiz: Quiz | undefined;
  for (const course of store.courses.values()) {
    for (const mod of course.modules) {
      const q = mod.quizzes.find((quiz) => quiz.id === id);
      if (q) {
        foundQuiz = q;
        break;
      }
    }
    if (foundQuiz) break;
  }

  if (!foundQuiz) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quiz not found' } });
  }

  let correctCount = 0;
  const gradedAnswers = foundQuiz.questions.map((question) => {
    const userSubmission = answers?.find((a: any) => a.questionId === question.id);
    const selected = userSubmission ? userSubmission.selectedOptionIds || [] : [];

    const correctOptionIds = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

    // Check if user's selection matches exactly
    const isCorrect =
      selected.length === correctOptionIds.length &&
      selected.every((id: string) => correctOptionIds.includes(id));

    if (isCorrect) correctCount++;

    return {
      questionId: question.id,
      selectedOptionIds: selected,
      isCorrect,
      correctOptionIds,
      explanation: isCorrect ? 'Great job! Correct response.' : 'Incorrect option chosen.',
    };
  });

  const totalQuestions = foundQuiz.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const attempt: QuizAttempt = {
    id: uuidv4(),
    quizId: id,
    userId,
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    answers: gradedAnswers,
    submittedAt: new Date().toISOString(),
  };

  store.quizAttempts.set(attempt.id, attempt);

  res.json({
    attempt: {
      id: attempt.id,
      quizId: id,
      score: correctCount,
      maxScore: totalQuestions,
      percentage,
      passed: percentage >= 60,
      breakdown: gradedAnswers,
    },
  });
};
