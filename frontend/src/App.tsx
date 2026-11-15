import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { CourseCatalog } from './pages/course-catalog/CourseCatalog';
import { CoursePlayer } from './pages/course-player/CoursePlayer';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { InstructorStudio } from './pages/instructor/InstructorStudio';
import { AdminPanel } from './pages/admin-panel/AdminPanel';
import { AuthModal } from './pages/auth/AuthModal';
import { useThemeStore } from './store/useThemeStore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'dashboard' | 'instructor' | 'admin'>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme } = useThemeStore();

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

  const isDark = theme === 'dark-ai' || theme === 'emerald-navy';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'dark-ai'
        ? 'bg-[#090d16] text-slate-100'
        : theme === 'emerald-navy'
        ? 'bg-[#040814] text-slate-100'
        : 'bg-[#f8fafc] text-slate-900'
    }`}>
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

      <footer className={`border-t py-6 text-center text-xs transition-colors duration-300 ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Vertexon Learning Technologies Pvt. Ltd. &copy; 2026. All rights reserved.</span>
          <span className="text-[11px] font-medium text-blue-500">LMS-AI Production Build v1.0 • RAG Embedded</span>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
