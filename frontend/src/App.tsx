import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { CourseCatalog } from './pages/course-catalog/CourseCatalog';
import { CoursePlayer } from './pages/course-player/CoursePlayer';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { InstructorStudio } from './pages/instructor/InstructorStudio';
import { AdminPanel } from './pages/admin-panel/AdminPanel';
import { AuthModal } from './pages/auth/AuthModal';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'dashboard' | 'instructor' | 'admin'>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { activeRole } = useAuthStore();

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleBackToCatalog = () => {
    setSelectedCourseId(null);
  };

  // If a course is selected, render Course Player
  if (selectedCourseId) {
    return (
      <CoursePlayer
        courseId={selectedCourseId}
        onBack={handleBackToCatalog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <main className="flex-grow">
        {currentTab === 'catalog' && (
          <CourseCatalog onSelectCourse={handleSelectCourse} />
        )}

        {currentTab === 'dashboard' && (
          <StudentDashboard
            onSelectCourse={handleSelectCourse}
            onExploreCatalog={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'instructor' && (
          <InstructorStudio />
        )}

        {currentTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Vertexon Learning Technologies Pvt. Ltd. &copy; 2026. All rights reserved.</span>
          <span className="text-[11px] text-blue-600 font-medium">LMS-AI Production Build v1.0 • RAG Embedded</span>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
