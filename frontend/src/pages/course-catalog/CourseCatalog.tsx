import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useThemeStore } from '../../store/useThemeStore';
import { Search, Sparkles, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
}

const DEFAULT_COURSES = [
  {
    id: 'course-dsa-101',
    title: 'Advanced Data Structures & Algorithms with AI Tutoring',
    description: 'Master binary search trees, graph algorithms, dynamic programming, and complexity analysis with an embedded RAG AI tutor grounded in lecture notes.',
    category: 'Computer Science',
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc13c2f829a?w=600',
    modules: [{ id: 'mod-1', title: 'Module 1: Trees & Complexity' }],
  },
  {
    id: 'course-ml-201',
    title: 'Applied Machine Learning & Generative AI Systems',
    description: 'Build real-world machine learning pipelines, vector retrieval architectures, and agentic workflows with Python, PyTorch, and pgvector.',
    category: 'Artificial Intelligence',
    difficulty: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600',
    modules: [{ id: 'mod-2', title: 'Module 1: Embeddings & Vector Search' }],
  },
  {
    id: 'course-web-301',
    title: 'Full-Stack Web Architecture with React & Node.js',
    description: 'Design production-grade SaaS systems with role-based access control, caching layers, and microservices.',
    category: 'Web Development',
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    modules: [{ id: 'mod-3', title: 'Module 1: API Foundations' }],
  },
];

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<any[]>(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({ 'course-dsa-101': true });

  const { theme } = useThemeStore();
  const isDark = theme === 'dark-ai' || theme === 'emerald-navy';

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Web Development'];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (search) params.q = search;

      const res = await api.get('/courses', { params });
      if (res.data.courses && res.data.courses.length > 0) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      let filtered = DEFAULT_COURSES;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter((c) => c.category === selectedCategory);
      }
      if (selectedDifficulty !== 'All') {
        filtered = filtered.filter((c) => c.difficulty === selectedDifficulty);
      }
      setCourses(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      await api.post(`/courses/${courseId}/enroll`);
    } catch (err) {}
    setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
    onSelectCourse(courseId);
  };

  const filteredCourses = courses.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dynamic Hero Banner Styled per Theme */}
      <div className={`relative rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden transition-all duration-300 border ${
        theme === 'minimal-light'
          ? 'bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-slate-200 text-slate-900 shadow-md'
          : theme === 'dark-ai'
          ? 'bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#131b2e] border-slate-800 text-white shadow-2xl'
          : 'bg-gradient-to-br from-[#0a152e] via-[#060e20] to-[#041a1c] border-emerald-950/80 text-white shadow-2xl'
      }`}>
        <div className="relative z-10 max-w-2xl">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
            theme === 'minimal-light'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : theme === 'emerald-navy'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
              : 'bg-slate-800/80 text-blue-300 border-slate-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Augmented Learning Engine</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Learn Smarter with Your Dedicated AI Tutor
          </h1>

          <p className={`text-base sm:text-lg mb-6 leading-relaxed ${
            theme === 'minimal-light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Every course includes an intelligent AI assistant grounded in lecture transcripts for instant doubt
            resolution, flashcards, and personalized study plans.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search algorithms, AI, systems..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 shadow-sm text-sm font-medium transition ${
              theme === 'minimal-light'
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-600'
                : theme === 'emerald-navy'
                ? 'bg-[#081226] border-emerald-950/80 text-white placeholder:text-slate-500 focus:ring-emerald-500'
                : 'bg-[#0f172a] border-slate-800 text-white placeholder:text-slate-500 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? theme === 'emerald-navy'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-5 w-px bg-slate-300/40 mx-1 hidden sm:block" />

          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider font-bold transition ${
                selectedDifficulty === diff
                  ? isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                  : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading course catalog...</div>
      ) : filteredCourses.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl border border-dashed p-8 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No courses match your filter</h3>
          <p className="text-sm text-slate-500 mt-1">Try resetting the category filter or searching for another topic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledMap[course.id];
            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className={`group rounded-3xl border overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  theme === 'minimal-light'
                    ? 'bg-white border-slate-200 hover:border-blue-300'
                    : theme === 'emerald-navy'
                    ? 'bg-[#0a1226] border-emerald-950/70 hover:border-emerald-800'
                    : 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-950/90 backdrop-blur-md text-white">
                        {course.difficulty}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold text-white flex items-center gap-1 backdrop-blur-md ${
                        theme === 'emerald-navy' ? 'bg-emerald-600/90' : 'bg-blue-600/90'
                      }`}>
                        <Sparkles className="w-3 h-3 text-amber-300" /> AI Grounded
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      theme === 'emerald-navy' ? 'text-emerald-400' : 'text-blue-500'
                    }`}>
                      {course.category}
                    </span>
                    <h3 className={`text-lg font-bold mt-1 line-clamp-2 transition ${
                      isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className={`border-t pt-4 flex items-center justify-between ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.modules?.length || 1} Modules
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        3.5 hrs
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleEnroll(e, course.id)}
                        className={`px-4 py-1.5 text-white text-xs font-bold rounded-xl shadow transition ${
                          theme === 'emerald-navy'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                      >
                        Enroll Free
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
