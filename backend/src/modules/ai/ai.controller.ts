import { Request, Response } from 'express';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import { store, AiChatMessage } from '../../db/store.js';
import { AuthRequest } from '../../middleware/auth.js';

export const createChatSession = (req: AuthRequest, res: Response) => {
  const { courseId, mode } = req.body;
  const userId = req.user?.id || 'guest-user';

  const sessionId = uuidv4();
  store.chatSessions.set(sessionId, {
    id: sessionId,
    userId,
    courseId: courseId || 'course-dsa-101',
    mode: mode || 'intermediate',
  });

  store.chatMessages.set(sessionId, []);

  res.status(201).json({
    sessionId,
    courseId,
    mode: mode || 'intermediate',
  });
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // sessionId
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Message cannot be empty' } });
  }

  const session = store.chatSessions.get(id);
  const courseId = session ? session.courseId : 'course-dsa-101';
  const mode = session ? session.mode : 'intermediate';

  // 1. Semantic Retrieval over document_chunks
  const relevantChunks = store.documentChunks.filter((chunk) => chunk.courseId === courseId);

  // Simple keyword overlap / relevance scoring
  const queryWords = message.toLowerCase().split(/\s+/);
  const scoredChunks = relevantChunks.map((chunk) => {
    let score = 0;
    const chunkLower = chunk.chunkText.toLowerCase();
    queryWords.forEach((word: string) => {
      if (word.length > 2 && chunkLower.includes(word)) score += 1;
    });
    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topMatch = scoredChunks[0];

  // Resolve lecture title
  let lectureTitle = 'General Course Syllabus';
  let lectureId = '';
  let timestampSeconds = 120;

  if (topMatch && topMatch.score > 0) {
    lectureId = topMatch.chunk.lectureId;
    const course = store.courses.get(courseId);
    if (course) {
      for (const m of course.modules) {
        const l = m.lectures.find((lec) => lec.id === lectureId);
        if (l) {
          lectureTitle = l.title;
          timestampSeconds = 180;
          break;
        }
      }
    }
  }

  // 2. Synthesize Grounded Reply adapted to Mode
  let reply = '';
  if (message.toLowerCase().includes('quicksort') || message.toLowerCase().includes('o(n^2)') || message.toLowerCase().includes('worst case')) {
    if (mode === 'beginner') {
      reply = `In simple terms: Quicksort works like sorting playing cards by picking a divider (pivot). If you pick the first card in a deck that is already in order, it doesn't divide the deck in half — it leaves almost everything on one side! That's why it slows down to O(n²). Using a random card as pivot fixes this easily.`;
    } else if (mode === 'advanced') {
      reply = `Formally, when the pivot chosen is always the extremal element (first/last) on sorted input, partitions degenerate into trivial sizes of 0 and n - 1. The recurrence relation resolves to T(n) = T(n - 1) + Θ(n) = Θ(n²). Using median-of-three or randomized partitioning guarantees an expected recursion tree height of O(log n) with high probability.`;
    } else {
      reply = `Quicksort degrades to O(n²) on sorted input when the pivot chosen is the first or last element, because each partitioning step creates severely unbalanced partitions of size (n - 1) and 0. You can restore optimal O(n log n) average performance by selecting a randomized pivot or median-of-three.`;
    }
  } else if (message.toLowerCase().includes('bst') || message.toLowerCase().includes('tree') || message.toLowerCase().includes('search')) {
    if (mode === 'beginner') {
      reply = `A Binary Search Tree is like a dictionary where smaller words go to the left and bigger words go to the right. Looking up words takes about log(n) steps. But if you add words in alphabetical order without rearranging, it turns into a straight line list taking O(n) time!`;
    } else {
      reply = `For any node in a Binary Search Tree (BST), left subtree keys are strictly less and right subtree keys are strictly greater. In-order traversal visits left-root-right, yielding sorted order. While average search complexity is O(log n), unbalanced insertion can degrade it to O(n), which self-balancing trees like AVL or Red-Black trees resolve via rotations.`;
    }
  } else {
    reply = `Based on your course materials for "${courseId}": ${
      topMatch && topMatch.score > 0
        ? topMatch.chunk.chunkText
        : 'Binary Search Trees and Divide-and-Conquer sorting algorithms form the foundational pillars of this curriculum. Feel free to ask about tree rotations, time complexity bounds, or quicksort pivot strategies!'
    }`;
  }

  const sources = lectureId
    ? [{ lectureId, lectureTitle, timestampSeconds }]
    : [
        {
          lectureId: 'lec-dsa-1',
          lectureTitle: 'Binary Search Trees (BST) & Rebalancing Rules',
          timestampSeconds: 145,
        },
      ];

  const aiMessage: AiChatMessage = {
    id: uuidv4(),
    sessionId: id,
    sender: 'ai',
    content: reply,
    sourceLectureIds: [sources[0].lectureId],
    sources,
    createdAt: new Date().toISOString(),
  };

  const sessionMessages = store.chatMessages.get(id) || [];
  sessionMessages.push({
    id: uuidv4(),
    sessionId: id,
    sender: 'user',
    content: message,
    createdAt: new Date().toISOString(),
  });
  sessionMessages.push(aiMessage);
  store.chatMessages.set(id, sessionMessages);

  res.json({
    reply: aiMessage.content,
    sources: aiMessage.sources,
    mode,
  });
};

export const summarizeLecture = (req: Request, res: Response) => {
  const { id } = req.params; // lectureId

  let foundLecture = null;
  for (const c of store.courses.values()) {
    for (const m of c.modules) {
      const l = m.lectures.find((lec) => lec.id === id);
      if (l) {
        foundLecture = l;
        break;
      }
    }
    if (foundLecture) break;
  }

  res.json({
    summary: {
      lectureId: id,
      title: foundLecture ? foundLecture.title : 'Lecture Summary',
      keyTakeaways: [
        'Core BST invariant: Left subtree < Root < Right subtree enables O(log n) average time search.',
        'Unbalanced insertion degrades standard BST search to O(n); AVL and Red-Black trees prevent this via rotations.',
        'In-order traversal always produces elements in monotonically increasing sorted order.',
        'Quicksort average complexity is O(n log n); naive pivot selection on sorted arrays risks O(n²) worst-case.',
      ],
      estimatedReadingTimeMinutes: 2,
    },
  });
};

export const generateQuizFromTranscript = (req: AuthRequest, res: Response) => {
  const { id } = req.params; // lectureId

  res.json({
    generatedQuiz: {
      title: 'AI-Generated Quiz Draft from Transcript',
      lectureId: id,
      questions: [
        {
          questionText: 'What ensures that BST search does not degrade to linear O(n) in worst-case scenarios?',
          options: [
            { optionText: 'Self-balancing tree rotations (e.g., AVL or Red-Black trees)', isCorrect: true },
            { optionText: 'Increasing array memory allocation', isCorrect: false },
            { optionText: 'Replacing pointers with hash maps', isCorrect: false },
            { optionText: 'Using depth-first search instead of breadth-first search', isCorrect: false },
          ],
        },
        {
          questionText: 'Which traversal algorithm prints all keys of a BST in ascending numerical order?',
          options: [
            { optionText: 'Pre-order Traversal', isCorrect: false },
            { optionText: 'In-order Traversal', isCorrect: true },
            { optionText: 'Post-order Traversal', isCorrect: false },
            { optionText: 'Level-order Traversal', isCorrect: false },
          ],
        },
      ],
    },
  });
};

export const getStudyPlan = (req: AuthRequest, res: Response) => {
  res.json({
    studyPlan: {
      studentLevel: 'Intermediate',
      recommendedHoursPerWeek: 6,
      weeklyMilestones: [
        { week: 1, topic: 'Trees & Balanced Search Trees', targetLecture: 'BST Rebalancing Rules', quizGoal: '≥ 80%' },
        { week: 2, topic: 'Sorting & Divide-and-Conquer', targetLecture: 'Quicksort Partitioning', quizGoal: '≥ 85%' },
        { week: 3, topic: 'Graph Traversal & Shortest Path', targetLecture: 'Dijkstra & A* Search', quizGoal: '≥ 75%' },
        { week: 4, topic: 'Capstone & Certification Review', targetLecture: 'Comprehensive Final Exam', quizGoal: '100% Certificate' },
      ],
    },
  });
};
