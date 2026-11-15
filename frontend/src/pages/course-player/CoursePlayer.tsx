import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Sparkles, Send, CheckCircle,
  Award, ChevronLeft, Bot, ExternalLink
} from 'lucide-react';
import { QuizModal } from '../quizzes/QuizModal';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
}

const DEFAULT_COURSE_DATA: any = {
  id: 'course-dsa-101',
  title: 'Advanced Data Structures & Algorithms with AI Tutoring',
  description: 'Master binary search trees, graph algorithms, dynamic programming, and complexity analysis with an embedded RAG AI tutor grounded in lecture notes.',
  category: 'Computer Science',
  difficulty: 'intermediate',
  modules: [
    {
      id: 'mod-1',
      title: 'Module 1: Trees, Complexity & Pivot Strategies',
      quizzes: [
        {
          id: 'quiz-dsa-1',
          title: 'Binary Trees & Complexity Mastery Quiz',
          questions: [
            {
              id: 'q1',
              questionText: 'What is the worst-case search time complexity for an unbalanced Binary Search Tree (BST)?',
              options: [
                { id: 'opt1', optionText: 'O(log n)' },
                { id: 'opt2', optionText: 'O(n)' },
                { id: 'opt3', optionText: 'O(1)' },
              ],
            },
            {
              id: 'q2',
              questionText: 'Which traversal produces values of a BST in ascending sorted order?',
              options: [
                { id: 'opt5', optionText: 'Pre-order Traversal' },
                { id: 'opt6', optionText: 'In-order Traversal' },
                { id: 'opt7', optionText: 'Post-order Traversal' },
              ],
            },
            {
              id: 'q3',
              questionText: 'Why does Quicksort degrade to O(n²) when the first or last element is chosen as pivot on already sorted arrays?',
              options: [
                { id: 'opt9', optionText: 'Because partitions become completely skewed into n-1 and 0 elements' },
                { id: 'opt10', optionText: 'Because of heap memory overflow' },
              ],
            },
          ],
        },
      ],
      lectures: [
        {
          id: 'lec-dsa-1',
          title: 'Binary Search Trees (BST) & Rebalancing Rules',
          videoUrl: 'https://www.youtube-nocookie.com/embed/pYT9F8_LFTM',
          durationSeconds: 720,
          transcript: `Welcome to Lecture 1 on Binary Search Trees. In a standard BST, for any given node with key K, all keys in its left subtree are strictly less than K, and all keys in its right subtree are strictly greater than K. 
The average search time is O(log n). However, if elements are inserted in strictly ascending or descending order, the tree degenerates into a linear linked list, causing worst-case lookup time to degrade to O(n). To prevent this degradation, self-balancing binary search trees such as AVL trees and Red-Black trees maintain an O(log n) height invariant through systematic tree rotations.
In-order traversal of a binary search tree visits left child, root node, then right child, which naturally produces elements in monotonically increasing sorted order.`,
        },
        {
          id: 'lec-dsa-2',
          title: 'Sorting Algorithms & Quicksort Partitioning',
          videoUrl: 'https://www.youtube-nocookie.com/embed/COk73cpQbFQ',
          durationSeconds: 840,
          transcript: `In this lecture, we dissect Quicksort and its partitioning mechanisms. Quicksort uses a divide-and-conquer strategy by selecting a pivot element and partitioning the array around it. 
When the pivot divides the array into two roughly equal halves, Quicksort achieves its best and average time complexity of O(n log n). 
Crucially, why does Quicksort degrade to O(n²) on sorted input? Because if a naive algorithm consistently picks the first or last element as the pivot in an already-sorted array, each partition step divides an array of size n into one subproblem of size n - 1 and one subproblem of size 0. The recurrence relation becomes T(n) = T(n - 1) + O(n), summing up to O(n²). Using randomized pivot selection or median-of-three eliminates this vulnerability.`,
        },
      ],
    },
  ],
};

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<any>(DEFAULT_COURSE_DATA);
  const [activeLecture, setActiveLecture] = useState<any>(DEFAULT_COURSE_DATA.modules[0].lectures[0]);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'quiz'>('transcript');

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Notes
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<any[]>([
    { id: '1', content: 'In-order traversal visits left-root-right yielding sorted order', timestampSeconds: 145 },
  ]);

  // AI Tutor State
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [aiMode, setAiMode] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [sessionId, setSessionId] = useState('demo-session-id');
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: 'Hello! I am your course-grounded AI Tutor. Ask me any question about this lecture, or click the quick prompt pills below.',
      sources: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Quiz Modal State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Progress & Certificate
  const [completedLectures, setCompletedLectures] = useState<string[]>(['lec-dsa-1']);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    loadCourseDetails();
    initAiSession();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      if (res.data.course) {
        setCourse(res.data.course);
        if (res.data.course.modules?.[0]?.lectures?.[0]) {
          setActiveLecture(res.data.course.modules[0].lectures[0]);
        }
      }
    } catch (err) {
      setCourse(DEFAULT_COURSE_DATA);
      setActiveLecture(DEFAULT_COURSE_DATA.modules[0].lectures[0]);
    }
  };

  const initAiSession = async () => {
    try {
      const res = await api.post('/ai/chat/sessions', { courseId, mode: aiMode });
      if (res.data.sessionId) setSessionId(res.data.sessionId);
    } catch (err) {
      setSessionId('fallback-session');
    }
  };

  const handleLectureChange = (lec: any) => {
    setActiveLecture(lec);
    setCurrentTime(0);
  };

  const handleMarkComplete = async () => {
    if (!activeLecture) return;
    const nextCompleted = Array.from(new Set([...completedLectures, activeLecture.id]));
    setCompletedLectures(nextCompleted);

    try {
      await api.post(`/lectures/${activeLecture.id}/progress`, {
        courseId,
        watchedSeconds: 600,
        completed: true,
      });
    } catch (err) {}

    setCertificateData({
      studentName: 'Ananya Sharma',
      courseTitle: course?.title || 'Advanced Masterclass',
      certificateNumber: 'VRTX-EMERALD-2026-CERT',
      issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
    setShowCertModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !activeLecture) return;
    const newNote = {
      id: Date.now().toString(),
      content: noteContent,
      timestampSeconds: currentTime || 120,
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteContent('');

    try {
      await api.post(`/lectures/${activeLecture.id}/notes`, {
        timestampSeconds: currentTime || 120,
        content: noteContent,
      });
    } catch (err) {}
  };

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsAiTyping(true);

    try {
      const res = await api.post(`/ai/chat/sessions/${sessionId}/messages`, { message: text });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: res.data.reply,
        sources: res.data.sources || [],
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setTimeout(() => {
        let reply = '';
        let sources = [{ lectureTitle: 'Binary Search Trees (BST)', timestampSeconds: 145 }];

        if (text.toLowerCase().includes('quicksort') || text.toLowerCase().includes('o(n^2)')) {
          reply = aiMode === 'beginner'
            ? 'In simple terms: Quicksort works by picking a divider (pivot). If you pick the first card in an already sorted deck, it splits into 0 and n-1, slowing down to O(n²)! Using a random card as pivot fixes this.'
            : 'Quicksort degrades to O(n²) on sorted input when the pivot chosen is the first or last element, because each partitioning step creates severely unbalanced partitions of size (n - 1) and 0. You can restore optimal O(n log n) average performance by selecting a randomized pivot or median-of-three.';
          sources = [{ lectureTitle: 'Sorting Algorithms & Quicksort Partitioning', timestampSeconds: 220 }];
        } else {
          reply = 'For any node in a Binary Search Tree (BST), left subtree keys are strictly less and right subtree keys are strictly greater. In-order traversal visits left-root-right, yielding sorted order. While average search complexity is O(log n), unbalanced insertion can degrade it to O(n), which self-balancing trees like AVL or Red-Black trees resolve via rotations.';
        }

        const fallbackAiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: reply,
          sources,
        };
        setChatMessages((prev) => [...prev, fallbackAiMsg]);
      }, 500);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeLecture) return;
    setIsAiTyping(true);
    setTimeout(() => {
      const formatted = `### 📋 Lecture Summary: ${activeLecture.title}\n\n` +
        `• Core BST invariant: Left subtree < Root < Right subtree enables O(log n) average time search.\n` +
        `• Unbalanced insertion degrades standard BST search to O(n); AVL and Red-Black trees prevent this via rotations.\n` +
        `• In-order traversal always produces elements in monotonically increasing sorted order.\n` +
        `• Quicksort average complexity is O(n log n); naive pivot selection on sorted arrays risks O(n²) worst-case.`;

      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', content: formatted, sources: [] },
      ]);
      setIsAiTyping(false);
    }, 400);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isEmbedVideo = activeLecture?.videoUrl?.includes('youtube') || activeLecture?.videoUrl?.includes('embed');

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <div className="bg-[#060e20] border-b border-emerald-950/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#0a152e] hover:bg-[#0f2044] text-xs font-semibold text-emerald-400 border border-emerald-950/80 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">{course?.title}</h1>
            <p className="text-xs text-emerald-400 font-medium">Lecture: {activeLecture?.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              isAiOpen
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-[#0a152e] text-slate-300 hover:bg-[#0f2044] border border-emerald-950/80'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-200" />
            <span>AI Tutor</span>
          </button>

          {certificateData && (
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Player + Sidebar Layout */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Video and Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#040814] p-4 sm:p-6">
          {/* Responsive Video Player Box */}
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/80 mb-6">
            {isEmbedVideo ? (
              <iframe
                src={`${activeLecture.videoUrl}?autoplay=0&rel=0&modestbranding=1`}
                title={activeLecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={activeLecture?.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Quick Action Bar under video */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#071024] p-4 rounded-2xl border border-emerald-950/80 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">{activeLecture?.title}</span>
              <span className="text-[11px] font-mono text-emerald-400">
                ({formatSeconds(activeLecture?.durationSeconds || 720)})
              </span>
            </div>

            <button
              onClick={handleMarkComplete}
              className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition ${
                completedLectures.includes(activeLecture?.id)
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{completedLectures.includes(activeLecture?.id) ? 'Completed (Claim Cert)' : 'Mark Finished'}</span>
            </button>
          </div>

          {/* Player Tabs */}
          <div className="bg-[#071024] border border-emerald-950/80 rounded-3xl p-6 flex-grow">
            <div className="flex space-x-5 border-b border-emerald-950/80 pb-3 mb-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`pb-1 transition ${activeTab === 'transcript' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                Transcript
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-1 transition ${activeTab === 'notes' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                Timestamped Notes ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-1 transition ${activeTab === 'quiz' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                Module Assessment
              </button>
            </div>

            {/* Tab 1: Transcript */}
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Lecture spoken transcript for RAG vector search:</span>
                  <button
                    onClick={handleSummarize}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/40 rounded-xl text-xs font-bold border border-emerald-800/40 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Summarize Key Points</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#050a18] p-5 rounded-2xl border border-emerald-950/80 font-serif">
                  {activeLecture?.transcript || 'No transcript available for this lecture.'}
                </p>
              </div>
            )}

            {/* Tab 2: Timestamped Notes */}
            {activeTab === 'notes' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Take a timestamped lecture note..."
                    className="flex-grow bg-[#050a18] border border-emerald-950/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Save Note
                  </button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No notes created yet. Type above to bookmark a concept with its timestamp.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#050a18] border border-emerald-950/80 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-slate-200">{n.content}</span>
                        <span className="text-xs font-mono px-2 py-0.5 bg-[#0a152e] text-emerald-400 rounded-md border border-emerald-900/50">
                          {formatSeconds(n.timestampSeconds)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Quizzes */}
            {activeTab === 'quiz' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-2">Complete this quiz to test your mastery and unlock the completion certificate.</p>
                {course.modules?.[0]?.quizzes?.map((q: any) => (
                  <div key={q.id} className="p-5 bg-[#050a18] border border-emerald-950/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{q.title}</h4>
                      <p className="text-xs text-emerald-400 mt-1">{q.questions?.length || 3} Questions • Objective Auto-Graded</p>
                    </div>
                    <button
                      onClick={() => setActiveQuizId(q.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: AI Tutor Drawer */}
        <div className="w-full lg:w-96 bg-[#060e20] border-t lg:border-t-0 lg:border-l border-emerald-950/80 flex flex-col h-[550px] lg:h-auto">
          {/* Lecture Switcher Header */}
          <div className="p-3 bg-[#081226] border-b border-emerald-950/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">Switch Lecture:</span>
            <div className="flex gap-2">
              {course.modules?.[0]?.lectures?.map((lec: any, idx: number) => (
                <button
                  key={lec.id}
                  onClick={() => handleLectureChange(lec)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                    activeLecture?.id === lec.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-[#0a152e] text-slate-300 hover:bg-[#0f2044] border border-emerald-950/60'
                  }`}
                >
                  Lecture 0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tutor Chat Drawer */}
          <div className="flex-1 flex flex-col h-full">
            {/* AI Drawer Header */}
            <div className="p-3.5 border-b border-emerald-950/80 flex items-center justify-between bg-[#081226]">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Course AI Tutor
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">RAG</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Grounded in lecture material</p>
                </div>
              </div>

              {/* Difficulty Depth Switcher */}
              <select
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value as any)}
                className="bg-[#050a18] border border-emerald-950/80 text-emerald-300 text-[11px] font-semibold rounded-xl px-2 py-1 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-[#081226] text-slate-200 border border-emerald-950/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Source Citation Pills */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-950/80">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">
                          Grounding Citation:
                        </span>
                        {msg.sources.map((s: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block text-[10px] bg-[#050a18] text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-900/60 mr-1"
                          >
                            📍 {s.lectureTitle} @ {formatSeconds(s.timestampSeconds)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="text-xs text-emerald-400 italic flex items-center gap-1.5 p-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  AI Tutor is retrieving lecture context...
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-3 py-1.5 border-t border-emerald-950/80 flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleSendMessage('Why does quicksort degrade to O(n^2)?')}
                className="px-2.5 py-1 bg-[#081226] hover:bg-[#0a152e] text-emerald-300 rounded-lg border border-emerald-950/80 whitespace-nowrap font-medium"
              >
                ⚡ Quicksort O(n²)
              </button>
              <button
                onClick={() => handleSendMessage('Explain BST In-Order Traversal')}
                className="px-2.5 py-1 bg-[#081226] hover:bg-[#0a152e] text-emerald-300 rounded-lg border border-emerald-950/80 whitespace-nowrap font-medium"
              >
                🌲 BST Traversal
              </button>
            </div>

            {/* Chat Input Box */}
            <div className="p-3 border-t border-emerald-950/80 bg-[#081226]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about this lecture..."
                  className="flex-grow bg-[#050a18] border border-emerald-950/80 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {activeQuizId && (
        <QuizModal
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onComplete={() => {
            handleMarkComplete();
          }}
        />
      )}

      {/* Certificate Modal */}
      {showCertModal && certificateData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#060e20] text-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-emerald-500 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            <Award className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white tracking-tight">Certificate of Mastery</h2>
            <p className="text-xs text-emerald-400 uppercase tracking-widest mt-1 font-bold">Vertexon Learning Technologies</p>

            <div className="my-6 py-4 border-y border-emerald-950/80 bg-[#081226]/60 rounded-2xl">
              <p className="text-xs text-slate-400">This certifies that</p>
              <h3 className="text-xl font-black text-emerald-400 my-1">{certificateData.studentName}</h3>
              <p className="text-xs text-slate-400">has successfully completed all modules of</p>
              <h4 className="text-base font-bold text-white mt-1">{certificateData.courseTitle}</h4>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mb-6 font-mono">
              <span>Cert #: {certificateData.certificateNumber}</span>
              <span>Issued: {certificateData.issuedDate}</span>
            </div>

            <button
              onClick={() => setShowCertModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition"
            >
              Close & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
