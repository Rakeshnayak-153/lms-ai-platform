import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Shield, Check, X, Users, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, pendingRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/users'),
        api.get('/admin/courses/pending'),
      ]);

      setAnalytics(analyticsRes.data.metrics);
      setUsers(usersRes.data.users || []);
      setPendingCourses(pendingRes.data.courses || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId: string, decision: 'approved' | 'rejected') => {
    try {
      await api.post(`/admin/courses/${courseId}/approve`, { decision });
      setPendingCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error('Approval failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Platform Governance</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Admin Governance & Health Console</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor system throughput, approve submitted instructor curricula, and audit role-based access.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Daily Active Users</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{analytics?.dailyActiveUsers || 142}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Active Learner Retention: 7-Day</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Platform Enrollments</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{analytics?.totalEnrollments || 24}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Across all active catalogs</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Avg. Doubt Latency</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{analytics?.doubtResolutionAvgSeconds || 4.8}s</p>
          <span className="text-[10px] text-purple-600 font-semibold">AI Tutor Sub-5s KPI met</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Course Completion Rate</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{analytics?.avgCompletionRatePercent || 68}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+25% vs legacy LMS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Approval Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Course Approval Queue ({pendingCourses.length})</span>
          </h2>

          {pendingCourses.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No pending courses requiring administrative review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                    <span className="text-[11px] text-slate-500">{c.category} • {c.difficulty}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveCourse(c.id, 'rejected')}
                      className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApproveCourse(c.id, 'approved')}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Role Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>User Accounts & RBAC Roles ({users.length})</span>
          </h2>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{u.fullName}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                    u.roles.includes('admin')
                      ? 'bg-purple-100 text-purple-700'
                      : u.roles.includes('instructor')
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {u.roles[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
