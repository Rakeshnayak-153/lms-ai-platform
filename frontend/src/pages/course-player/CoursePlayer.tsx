import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Play, Pause, Volume2, Sparkles, Send, BookOpen, CheckCircle,
  FileText, Award, ChevronLeft, Bot, HelpCircle, Layers, ArrowRight
} from 'lucide-react';
import { QuizModal } from '../quizzes/QuizModal';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<any>(null);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'quiz'>('transcript');

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Notes
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  // AI Tutor State
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [aiMode, setAiMode] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [sessionId, setSessionId] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: 'Hello! I am your course-grounded AI Tutor. Ask me any question about this lecture, or click "Summarize" for quick review.',
      sources: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Quiz Modal State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Progress & Certificate
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    loadCourseDetails();
    initAiSession();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${courseId}`);
      const c = res.data.course;
      setCourse(c);

      // Default to first lecture
      if (c.modules?.[0]?.lectures?.[0]) {
        setActiveLecture(c.modules[0].lectures[0]);
      }

      // Load existing notes
      if (c.modules?.[0]?.lectures?.[0]) {
        loadNotes(c.modules[0].lectures[0].id);
      }
    } catch (err) {
      console.error('Failed to load course', err);
    } finally {
      setLoading(false);
    }
  };

  const initAiSession = async () => {
    try {
      const res = await api.post('/ai/chat/sessions', { courseId, mode: aiMode });
      setSessionId(res.data.sessionId);
    } catch (err) {
      console.error('Failed to init AI session', err);
    }
  };

  const loadNotes = async (lecId: string) => {
    try {
      const res = await api.get(`/lectures/${lecId}/notes`);
      setNotes(res.data.notes || []);
    } catch (err) {
      // notes may be empty
    }
  };

  const handleLectureChange = (lec: any) => {
    setActiveLecture(lec);
    loadNotes(lec.id);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 1);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLecture) return;
    try {
      const nextCompleted = Array.from(new Set([...completedLectures, activeLecture.id]));
      setCompletedLectures(nextCompleted);

      const res = await api.post(`/lectures/${activeLecture.id}/progress`, {
        courseId,
        watchedSeconds: Math.round(currentTime),
        completed: true,
      });

      if (res.data.enrollment?.certificateIssued) {
        // Fetch certificate
        fetchCertificate();
      }
    } catch (err) {
      console.error('Progress update error', err);
    }
  };

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/certificates/${courseId}`);
      setCertificateData(res.data.certificate);
      setShowCertModal(true);
    } catch (err) {
      console.error('Certificate fetch error', err);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !activeLecture) return;
    try {
      const res = await api.post(`/lectures/${activeLecture.id}/notes`, {
        timestampSeconds: Math.round(currentTime),
        content: noteContent,
      });
      setNotes((prev) => [res.data.note, ...prev]);
      setNoteContent('');
    } catch (err) {
      console.error('Failed to save note', err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim() || !sessionId) return;

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
      console.error('AI message failed', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeLecture) return;
    setIsAiTyping(true);
    try {
      const res = await api.post(`/ai/lectures/${activeLecture.id}/summarize`);
      const summary = res.data.summary;
      const formatted = `### 📋 Lecture Summary: ${summary.title}\n\n` +
        summary.keyTakeaways.map((item: string) => `• ${item}`).join('\n');

      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', content: formatted, sources: [] },
      ]);
    } catch (err) {
      console.error('Summary error', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (loading || !course) {
    return <div className="p-12 text-center text-slate-500">Loading course player...</div>;
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">{course.title}</h1>
            <p className="text-xs text-slate-400">Current: {activeLecture?.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isAiOpen
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>AI Tutor</span>
          </button>

          {certificateData && (
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
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
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900 p-4 sm:p-6">
          {/* Video Player Box */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 mb-6">
            <video
              ref={videoRef}
              src={activeLecture?.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleMarkComplete}
              className="w-full h-full object-contain"
            />

            {/* Custom Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg transition"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <span className="text-xs font-mono text-slate-300">
                  {formatSeconds(currentTime)} / {formatSeconds(duration || activeLecture?.durationSeconds || 600)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Speed Controls */}
                <div className="flex items-center space-x-1 bg-slate-800/80 rounded-lg p-1 text-xs">
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleMarkComplete}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    completedLectures.includes(activeLecture?.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{completedLectures.includes(activeLecture?.id) ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Player Tabs */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex-grow">
            <div className="flex space-x-4 border-b border-slate-800 pb-3 mb-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`pb-1 transition ${activeTab === 'transcript' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Transcript
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-1 transition ${activeTab === 'notes' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Timestamped Notes ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-1 transition ${activeTab === 'quiz' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Module Assessment
              </button>
            </div>

            {/* Tab 1: Transcript */}
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Full lecture spoken transcript for RAG analysis:</span>
                  <button
                    onClick={handleSummarize}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-medium border border-blue-500/30 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Summarize Key Points</span>
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-serif">
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
                    placeholder={`Take a note at ${formatSeconds(currentTime)}...`}
                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Save Note
                  </button>
                </div>

                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No notes created yet. Type above to bookmark a concept with its timestamp.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-slate-200">{n.content}</span>
                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-blue-400 rounded-md">
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
                  <div key={q.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{q.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{q.questions?.length || 3} Questions • Objective Auto-Graded</p>
                    </div>
                    <button
                      onClick={() => setActiveQuizId(q.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Syllabus & AI Drawer */}
        <div className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[550px] lg:h-auto">
          {isAiOpen ? (
            /* AI Tutor Chat Drawer */
            <div className="flex-1 flex flex-col h-full">
              {/* AI Drawer Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Course AI Tutor
                      <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[10px]">RAG</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Grounded in lecture material</p>
                  </div>
                </div>

                {/* Difficulty Depth Switcher */}
                <select
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
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
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Source Citation Pills */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-semibold text-amber-400 block mb-1">
                            Grounding Citation:
                          </span>
                          {msg.sources.map((s: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-block text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 mr-1"
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
                  <div className="text-xs text-slate-400 italic flex items-center gap-1.5 p-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    AI Tutor is retrieving lecture context...
                  </div>
                )}
              </div>

              {/* Quick Prompt Pills */}
              <div className="px-3 py-1.5 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => handleSendMessage('Why does quicksort degrade to O(n^2)?')}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap"
                >
                  ⚡ Quicksort O(n²)
                </button>
                <button
                  onClick={() => handleSendMessage('Explain BST In-Order Traversal')}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 whitespace-nowrap"
                >
                  🌲 BST Traversal
                </button>
              </div>

              {/* Chat Input Box */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/60">
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
                    className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Syllabus Accordion */
            <div className="p-4 overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Course Syllabus</h3>
              {course.modules?.map((m: any, mIdx: number) => (
                <div key={m.id} className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">{m.title}</h4>
                  <div className="space-y-1">
                    {m.lectures?.map((lec: any, lIdx: number) => (
                      <button
                        key={lec.id}
                        onClick={() => handleLectureChange(lec)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                          activeLecture?.id === lec.id
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-slate-900 text-slate-400'
                        }`}
                      >
                        <span className="line-clamp-1">{lec.title}</span>
                        {completedLectures.includes(lec.id) && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-amber-400 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
            <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Certificate of Mastery</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Vertexon Learning Technologies</p>

            <div className="my-6 py-4 border-y border-slate-200">
              <p className="text-xs text-slate-500">This certifies that</p>
              <h3 className="text-xl font-bold text-blue-700 my-1">{certificateData.studentName}</h3>
              <p className="text-xs text-slate-500">has successfully completed all modules of</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">{certificateData.courseTitle}</h4>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 mb-6 font-mono">
              <span>Cert #: {certificateData.certificateNumber}</span>
              <span>Issued: {certificateData.issuedDate}</span>
            </div>

            <button
              onClick={() => setShowCertModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition"
            >
              Close & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
