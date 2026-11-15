import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BookOpen, Flame, Award, ArrowRight, Play, Sparkles } from 'lucide-react';

interface StudentDashboardProps {
  onSelectCourse: (courseId: string) => void;
  onExploreCatalog: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onSelectCourse, onExploreCatalog }) => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'emerald-navy' || theme === 'dark-ai';

  const [enrollments, setEnrollments] = useState<any[]>([
    {
      enrollment: { id: 'enr-1', progressPercent: 65, completedLectures: ['lec-1'] },
      course: {
        id: 'course-dsa-101',
        title: 'Advanced Data Structures & Algorithms with AI Tutoring',
        category: 'Computer Science',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc13c2f829a?w=600',
      },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>({
    weeklyMilestones: [
      { week: 1, topic: 'Trees & Balanced Search Trees', targetLecture: 'BST Rebalancing Rules', quizGoal: '≥ 80%' },
      { week: 2, topic: 'Sorting & Divide-and-Conquer', targetLecture: 'Quicksort Partitioning', quizGoal: '≥ 85%' },
      { week: 3, topic: 'Graph Traversal & Shortest Path', targetLecture: 'Dijkstra & A* Search', quizGoal: '≥ 75%' },
    ],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const enrRes = await api.get('/enrollments/me');
      if (enrRes.data.enrollments?.length > 0) {
        setEnrollments(enrRes.data.enrollments);
      }
      const planRes = await api.get('/ai/study-plan');
      if (planRes.data.studyPlan) {
        setStudyPlan(planRes.data.studyPlan);
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Welcome Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        theme === 'emerald-navy'
          ? 'bg-[#081226] border-emerald-950/80 text-white'
          : isDark
          ? 'bg-[#0f172a] border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${
            theme === 'emerald-navy' ? 'text-emerald-400' : 'text-blue-600'
          }`}>
            Student Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome back, {user?.fullName || 'Ananya'}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Keep up your momentum — your AI tutor is ready for today's study session.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
            theme === 'emerald-navy'
              ? 'bg-[#050a18] border-emerald-950/80'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-500">Daily Streak</span>
              <p className="text-xl font-black">{user?.streak?.current || 5} Days</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
            theme === 'emerald-navy'
              ? 'bg-[#050a18] border-emerald-950/80'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400">Badges Earned</span>
              <p className="text-xl font-black">3 Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${theme === 'emerald-navy' ? 'text-emerald-400' : 'text-blue-500'}`} />
              <span>In-Progress Courses</span>
            </h2>
            <button
              onClick={onExploreCatalog}
              className={`text-xs font-semibold flex items-center gap-1 ${
                theme === 'emerald-navy' ? 'text-emerald-400 hover:text-emerald-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading your enrollments...</div>
          ) : (
            <div className="space-y-4">
              {enrollments.map(({ enrollment, course }) => {
                if (!course) return null;
                return (
                  <div
                    key={enrollment.id}
                    className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      theme === 'emerald-navy'
                        ? 'bg-[#081226] border-emerald-950/80 hover:border-emerald-800'
                        : isDark
                        ? 'bg-[#0f172a] border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          theme === 'emerald-navy' ? 'text-emerald-400' : 'text-blue-500'
                        }`}>
                          {course.category}
                        </span>
                        <h3 className="text-base font-bold line-clamp-1 mt-0.5">{course.title}</h3>
                        <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400">
                          <span>{enrollment.progressPercent}% Completed</span>
                          <span>•</span>
                          <span>{enrollment.completedLectures?.length || 1} Lectures Finished</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Resume</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Study Plan & Badges */}
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 border shadow-xl ${
            theme === 'emerald-navy'
              ? 'bg-gradient-to-br from-[#0a1838] to-[#040c1e] border-emerald-900/60'
              : 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-800/50 text-white'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold text-white">AI Personalized Study Plan</h3>
            </div>
            <p className="text-xs text-emerald-200/80 mb-4 leading-relaxed">
              Based on your quiz performance, your AI tutor recommends allocating 6 hours this week:
            </p>

            <div className="space-y-3">
              {studyPlan?.weeklyMilestones?.slice(0, 3).map((item: any) => (
                <div key={item.week} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Week {item.week}: {item.topic}</span>
                    <span className="text-emerald-400 font-mono">{item.quizGoal}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Target: {item.targetLecture}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-6 border shadow-sm ${
            theme === 'emerald-navy'
              ? 'bg-[#081226] border-emerald-950/80'
              : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Earned Milestone Badges</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#050a18] rounded-2xl border border-emerald-950/80">
                <span className="text-2xl block mb-1">⚡</span>
                <span className="text-[10px] font-bold text-white block">7-Day Streak</span>
                <span className="text-[9px] text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="p-3 bg-[#050a18] rounded-2xl border border-emerald-950/80">
                <span className="text-2xl block mb-1">🎯</span>
                <span className="text-[10px] font-bold text-white block">Quiz Ace</span>
                <span className="text-[9px] text-emerald-400 font-semibold">100% Score</span>
              </div>
              <div className="p-3 bg-[#050a18] rounded-2xl border border-emerald-950/80">
                <span className="text-2xl block mb-1">🤖</span>
                <span className="text-[10px] font-bold text-white block">AI Scholar</span>
                <span className="text-[9px] text-emerald-400 font-semibold">10+ Queries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
