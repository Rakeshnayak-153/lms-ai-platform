import crypto from 'crypto';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  roles: string[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  modules: Module[];
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lectures: Lecture[];
  quizzes: Quiz[];
}

export interface Lecture {
  id: string;
  moduleId: string;
  title: string;
  videoUrl: string;
  transcript: string;
  durationSeconds: number;
  orderIndex: number;
  resourceUrls: string[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedLectures: string[];
  watchedSeconds: Record<string, number>; // lectureId -> seconds
  certificateIssued: boolean;
  certificateUrl?: string;
}

export interface Note {
  id: string;
  userId: string;
  lectureId: string;
  timestampSeconds: number;
  content: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  lectureId: string;
  timestampSeconds: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  isAiGenerated: boolean;
  generatedFromLectureId?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'mcq' | 'multi_select' | 'short_answer';
  orderIndex: number;
  options: { id: string; optionText: string; isCorrect: boolean }[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: { questionId: string; selectedOptionIds: string[]; isCorrect: boolean }[];
  submittedAt: string;
}

export interface DocumentChunk {
  id: string;
  courseId: string;
  lectureId: string;
  chunkText: string;
  embedding: number[];
}

export interface AiChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  content: string;
  sourceLectureIds?: string[];
  sources?: { lectureId: string; lectureTitle: string; timestampSeconds: number }[];
  createdAt: string;
}

// In-Memory resilient store with rich seed data
class InMemoryStore {
  users: Map<string, User> = new Map();
  courses: Map<string, Course> = new Map();
  enrollments: Map<string, Enrollment> = new Map(); // key: `${userId}_${courseId}`
  notes: Map<string, Note> = new Map();
  bookmarks: Map<string, Bookmark> = new Map();
  quizAttempts: Map<string, QuizAttempt> = new Map();
  documentChunks: DocumentChunk[] = [];
  chatSessions: Map<string, { id: string; userId: string; courseId: string; mode: string }> = new Map();
  chatMessages: Map<string, AiChatMessage[]> = new Map(); // sessionId -> messages
  streaks: Map<string, { current: number; longest: number; lastActiveDate: string }> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // 1. Seed Users (passwords hashed for "Password123")
    // bcrypt hash of "Password123" is $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
    const sampleHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const student: User = {
      id: 'student-uuid-1',
      fullName: 'Ananya Sharma',
      email: 'student@example.com',
      passwordHash: sampleHash,
      roles: ['student'],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const instructor: User = {
      id: 'instructor-uuid-1',
      fullName: 'Rohit Verma',
      email: 'instructor@example.com',
      passwordHash: sampleHash,
      roles: ['instructor'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const admin: User = {
      id: 'admin-uuid-1',
      fullName: 'Meera Patel',
      email: 'admin@example.com',
      passwordHash: sampleHash,
      roles: ['admin'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(student.id, student);
    this.users.set(instructor.id, instructor);
    this.users.set(admin.id, admin);

    this.streaks.set(student.id, {
      current: 5,
      longest: 12,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });

    // 2. Seed Course 1: Data Structures & Algorithms with AI
    const course1Id = 'course-dsa-101';
    const c1Module1Id = 'mod-dsa-1';
    const c1Lec1Id = 'lec-dsa-1';
    const c1Lec2Id = 'lec-dsa-2';

    const c1Quiz1: Quiz = {
      id: 'quiz-dsa-1',
      moduleId: c1Module1Id,
      title: 'Binary Trees & Complexity Mastery Quiz',
      isAiGenerated: true,
      generatedFromLectureId: c1Lec1Id,
      questions: [
        {
          id: 'q1',
          quizId: 'quiz-dsa-1',
          questionText: 'What is the worst-case search time complexity for an unbalanced Binary Search Tree (BST)?',
          questionType: 'mcq',
          orderIndex: 1,
          options: [
            { id: 'opt1', optionText: 'O(log n)', isCorrect: false },
            { id: 'opt2', optionText: 'O(n)', isCorrect: true },
            { id: 'opt3', optionText: 'O(1)', isCorrect: false },
            { id: 'opt4', optionText: 'O(n log n)', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          quizId: 'quiz-dsa-1',
          questionText: 'Which traversal produces values of a BST in ascending sorted order?',
          questionType: 'mcq',
          orderIndex: 2,
          options: [
            { id: 'opt5', optionText: 'Pre-order Traversal', isCorrect: false },
            { id: 'opt6', optionText: 'In-order Traversal', isCorrect: true },
            { id: 'opt7', optionText: 'Post-order Traversal', isCorrect: false },
            { id: 'opt8', optionText: 'Level-order Traversal', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          quizId: 'quiz-dsa-1',
          questionText: 'Why does Quicksort degrade to O(n²) when the first or last element is chosen as pivot on already sorted arrays?',
          questionType: 'mcq',
          orderIndex: 3,
          options: [
            { id: 'opt9', optionText: 'Because partitions become completely skewed into n-1 and 0 elements', isCorrect: true },
            { id: 'opt10', optionText: 'Because of heap memory overflow', isCorrect: false },
            { id: 'opt11', optionText: 'Because it cannot compare numbers', isCorrect: false },
            { id: 'opt12', optionText: 'Because recursion depth is clamped to 10', isCorrect: false },
          ],
        },
      ],
    };

    const course1: Course = {
      id: course1Id,
      instructorId: instructor.id,
      title: 'Advanced Data Structures & Algorithms with AI Tutoring',
      description: 'Master binary search trees, graph algorithms, dynamic programming, and complexity analysis with an embedded RAG AI tutor grounded in lecture notes.',
      category: 'Computer Science',
      difficulty: 'intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc13c2f829a?w=600',
      price: 0,
      status: 'approved',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      modules: [
        {
          id: c1Module1Id,
          courseId: course1Id,
          title: 'Module 1: Trees, Graphs & Complexity Foundations',
          orderIndex: 1,
          quizzes: [c1Quiz1],
          lectures: [
            {
              id: c1Lec1Id,
              moduleId: c1Module1Id,
              title: 'Binary Search Trees (BST) & Rebalancing Rules',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              durationSeconds: 720,
              orderIndex: 1,
              resourceUrls: ['https://example.com/bst-cheat-sheet.pdf'],
              transcript: `Welcome to Lecture 1 on Binary Search Trees. In a standard BST, for any given node with key K, all keys in its left subtree are strictly less than K, and all keys in its right subtree are strictly greater than K. 
              The average search time is O(log n). However, if elements are inserted in strictly ascending or descending order, the tree degenerates into a linear linked list, causing worst-case lookup time to degrade to O(n). To prevent this degradation, self-balancing binary search trees such as AVL trees and Red-Black trees maintain an O(log n) height invariant through systematic tree rotations.
              In-order traversal of a binary search tree visits left child, root node, then right child, which naturally produces elements in monotonically increasing sorted order.`,
            },
            {
              id: c1Lec2Id,
              moduleId: c1Module1Id,
              title: 'Sorting Algorithms & Quicksort Partitioning',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              durationSeconds: 840,
              orderIndex: 2,
              resourceUrls: [],
              transcript: `In this lecture, we dissect Quicksort and its partitioning mechanisms. Quicksort uses a divide-and-conquer strategy by selecting a pivot element and partitioning the array around it. 
              When the pivot divides the array into two roughly equal halves, Quicksort achieves its best and average time complexity of O(n log n). 
              Crucially, why does Quicksort degrade to O(n²) on sorted input? Because if a naive algorithm consistently picks the first or last element as the pivot in an already-sorted array, each partition step divides an array of size n into one subproblem of size n - 1 and one subproblem of size 0. The recurrence relation becomes T(n) = T(n - 1) + O(n), summing up to O(n²). Using randomized pivot selection or median-of-three eliminates this vulnerability.`,
            },
          ],
        },
      ],
    };

    // 3. Seed Course 2: Full-Stack Machine Learning & LLMs
    const course2Id = 'course-ml-201';
    const course2: Course = {
      id: course2Id,
      instructorId: instructor.id,
      title: 'Applied Machine Learning & Generative AI Systems',
      description: 'Build real-world machine learning pipelines, vector retrieval architectures, and agentic workflows with Python, PyTorch, and pgvector.',
      category: 'Artificial Intelligence',
      difficulty: 'advanced',
      thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600',
      price: 0,
      status: 'approved',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      modules: [
        {
          id: 'mod-ml-1',
          courseId: course2Id,
          title: 'Module 1: Embeddings & Vector Search Foundations',
          orderIndex: 1,
          quizzes: [],
          lectures: [
            {
              id: 'lec-ml-1',
              moduleId: 'mod-ml-1',
              title: 'Vector Embeddings & Cosine Similarity in pgvector',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              durationSeconds: 610,
              orderIndex: 1,
              resourceUrls: [],
              transcript: `Vector embeddings transform high-dimensional unstructured text into dense numerical coordinate vectors. Two pieces of text with similar semantic meaning have high cosine similarity. In PostgreSQL, the pgvector extension allows indexing vector embeddings using IVFFlat or HNSW indexes for sub-millisecond nearest neighbor search over millions of chunks.`,
            },
          ],
        },
      ],
    };

    this.courses.set(course1.id, course1);
    this.courses.set(course2.id, course2);

    // 4. Seed Enrollment for Student
    const enrollment1Key = `${student.id}_${course1Id}`;
    this.enrollments.set(enrollment1Key, {
      id: 'enr-1',
      userId: student.id,
      courseId: course1Id,
      enrolledAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      progressPercent: 50,
      completedLectures: [c1Lec1Id],
      watchedSeconds: { [c1Lec1Id]: 720, [c1Lec2Id]: 300 },
      certificateIssued: false,
    });

    // 5. Seed RAG Document Chunks for Course 1
    this.documentChunks.push(
      {
        id: 'chunk-1',
        courseId: course1Id,
        lectureId: c1Lec1Id,
        chunkText: 'Binary Search Trees (BST) enforce the property that for node K, left subtree keys are < K and right subtree keys are > K. Average search complexity is O(log n), but on sorted inputs degrades to O(n) without self-balancing (AVL/Red-Black).',
        embedding: [0.1, 0.2, 0.3],
      },
      {
        id: 'chunk-2',
        courseId: course1Id,
        lectureId: c1Lec1Id,
        chunkText: 'In-order traversal of a Binary Search Tree (left, root, right) yields all node values in monotonically ascending sorted order.',
        embedding: [0.15, 0.25, 0.35],
      },
      {
        id: 'chunk-3',
        courseId: course1Id,
        lectureId: c1Lec2Id,
        chunkText: 'Quicksort degrades to O(n^2) on sorted inputs when naive pivot selection (first or last element) is used, because partitions become completely skewed into n-1 and 0 subproblems. Median-of-three or randomized pivots restore O(n log n) runtime.',
        embedding: [0.2, 0.4, 0.6],
      }
    );
  }
}

export const store = new InMemoryStore();
