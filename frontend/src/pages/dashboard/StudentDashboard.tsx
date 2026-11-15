import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { BookOpen, Flame, Award, ArrowRight, Play, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

interface StudentDashboardProps {
  onSelectCourse: (courseId: string) => void;
  onExploreCatalog: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onSelectCourse, onExploreCatalog }) => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const enrRes = await api.get('/enrollments/me');
      setEnrollments(enrRes.data.enrollments || []);

      const planRes = await api.get('/ai/study-plan');
      setStudyPlan(planRes.data.studyPlan);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Student Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Welcome back, {user?.fullName || 'Student'}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Keep up your momentum — your AI tutor is ready for today's study session.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-700">Daily Streak</span>
              <p className="text-xl font-black text-slate-900">{user?.streak?.current || 5} Days</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-700">Badges Earned</span>
              <p className="text-xl font-black text-slate-900">3 Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>In-Progress Courses</span>
            </h2>
            <button
              onClick={onExploreCatalog}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading your enrollments...</div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No enrolled courses yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Enroll in your first course to start learning with your AI tutor.</p>
              <button
                onClick={onExploreCatalog}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map(({ enrollment, course }) => {
                if (!course) return null;
                return (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          {course.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                        <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-500">
                          <span>{enrollment.progressPercent}% Completed</span>
                          <span>•</span>
                          <span>{enrollment.completedLectures?.length || 0} Lectures Finished</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Progress circle/bar */}
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
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

        {/* Right Column: AI Personalized Study Plan & Badges */}
        <div className="space-y-6">
          {/* AI Study Plan Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold">AI Personalized Study Plan</h3>
            </div>
            <p className="text-xs text-indigo-200 mb-4 leading-relaxed">
              Based on your quiz performance, your AI tutor recommends allocating 6 hours this week:
            </p>

            <div className="space-y-3">
              {studyPlan?.weeklyMilestones?.slice(0, 3).map((item: any) => (
                <div key={item.week} className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-xs">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Week {item.week}: {item.topic}</span>
                    <span className="text-amber-300">{item.quizGoal}</span>
                  </div>
                  <p className="text-[11px] text-indigo-200">Target: {item.targetLecture}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification Milestone Badges */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Earned Milestone Badges</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-2xl block mb-1">⚡</span>
                <span className="text-[10px] font-bold text-slate-800 block">7-Day Streak</span>
                <span className="text-[9px] text-amber-600 font-semibold">Active</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-2xl block mb-1">🎯</span>
                <span className="text-[10px] font-bold text-slate-800 block">Quiz Ace</span>
                <span className="text-[9px] text-blue-600 font-semibold">100% Score</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-2xl block mb-1">🤖</span>
                <span className="text-[10px] font-bold text-slate-800 block">AI Scholar</span>
                <span className="text-[9px] text-purple-600 font-semibold">10+ Questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
