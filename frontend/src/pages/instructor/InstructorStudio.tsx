import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, Plus, Sparkles, Video, CheckCircle2, BarChart2, Layers, Upload, ArrowRight } from 'lucide-react';

export const InstructorStudio: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Course Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('intermediate');

  // AI Quiz Generator State
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
      if (res.data.courses?.[0]) {
        setSelectedCourse(res.data.courses[0]);
      }
    } catch (err) {
      console.error('Failed to load instructor courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', {
        title,
        description,
        category,
        difficulty,
      });
      setCourses([res.data.course, ...courses]);
      setSelectedCourse(res.data.course);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create course', err);
    }
  };

  const handleAiQuizGenerate = async () => {
    const lectureId = selectedCourse?.modules?.[0]?.lectures?.[0]?.id || 'lec-dsa-1';
    setGeneratingQuiz(true);
    try {
      const res = await api.post(`/ai/lectures/${lectureId}/generate-quiz`);
      setGeneratedQuiz(res.data.generatedQuiz);
    } catch (err) {
      console.error('AI quiz gen error', err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Instructor Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Course Authoring & AI Studio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Author courses, upload transcripts for RAG ingestion, and review AI-generated quiz drafts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">1,240</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+18% this week</span>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Avg. Quiz Score</span>
          <p className="text-2xl font-black text-slate-900 mt-1">84.2%</p>
          <span className="text-[10px] text-blue-600 font-semibold">Objective Auto-Graded</span>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Avg. Doubt Resolution</span>
          <p className="text-2xl font-black text-slate-900 mt-1">4.2s</p>
          <span className="text-[10px] text-purple-600 font-semibold">AI Tutor Handled</span>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Course Completion Rate</span>
          <p className="text-2xl font-black text-slate-900 mt-1">72%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+25% above baseline</span>
        </div>
      </div>

      {/* Course Manager & AI Quiz Reviewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course Syllabus Builder */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedCourse?.title || 'Selected Course'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Category: {selectedCourse?.category} • Level: {selectedCourse?.difficulty}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
              Approved
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum & Lecture Transcripts</h3>
            {selectedCourse?.modules?.map((m: any) => (
              <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3">{m.title}</h4>
                <div className="space-y-2">
                  {m.lectures?.map((lec: any) => (
                    <div
                      key={lec.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <Video className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-semibold text-slate-800">{lec.title}</span>
                          <span className="text-[11px] text-slate-400 block line-clamp-1">{lec.transcript?.substring(0, 70)}...</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                        RAG Chunked
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Auto-Quiz Generator & Reviewer */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold text-white">AI Auto-Quiz Engine</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Auto-generate 5 questions directly from your lecture transcript for instant review and 1-click publishing.
          </p>

          <button
            onClick={handleAiQuizGenerate}
            disabled={generatingQuiz}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mb-6"
          >
            {generatingQuiz ? 'Extracting concepts...' : '⚡ Generate Quiz from Transcript'}
          </button>

          {generatedQuiz && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Review & Approve Draft
              </span>
              <div className="space-y-3">
                {generatedQuiz.questions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="font-semibold text-slate-200 mb-2">Q{idx + 1}: {q.questionText}</p>
                    <div className="space-y-1">
                      {q.options?.map((opt: any, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-1.5 rounded text-[11px] ${
                            opt.isCorrect
                              ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/60'
                              : 'text-slate-400'
                          }`}
                        >
                          {opt.optionText} {opt.isCorrect && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  alert('Quiz draft approved and published to module!');
                  setGeneratedQuiz(null);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Approve & Publish Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Masterclass Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Design & Distributed Architectures"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief curriculum overview..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Web Development">Web Development</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
