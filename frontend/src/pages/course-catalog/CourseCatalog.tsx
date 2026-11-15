import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, Sparkles, BookOpen, Clock, BarChart3, CheckCircle2 } from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Web Development'];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [selectedCategory, selectedDifficulty]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (search) params.q = search;

      const res = await api.get('/courses', { params });
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments/me');
      const map: Record<string, boolean> = {};
      res.data.enrollments?.forEach((item: any) => {
        if (item.course?.id) map[item.course.id] = true;
      });
      setEnrolledMap(map);
    } catch (err) {
      // User may not be logged in yet
    }
  };

  const handleEnroll = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
      onSelectCourse(courseId);
    } catch (err) {
      console.error('Enrollment failed', err);
      onSelectCourse(courseId);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Augmented Learning</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Learn Smarter with Your Dedicated AI Tutor
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-6 leading-relaxed">
            Every course includes an intelligent AI assistant grounded in lecture transcripts for instant doubt
            resolution, flashcards, and personalized study plans.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search algorithms, AI, systems..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
          />
        </div>

        {/* Categories & Difficulty */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading course catalog...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No courses match your filter</h3>
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white">
                        {course.difficulty}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600/90 backdrop-blur-md text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> AI Grounded
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.modules?.length || 1} Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        3.5 hrs
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleEnroll(e, course.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
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
