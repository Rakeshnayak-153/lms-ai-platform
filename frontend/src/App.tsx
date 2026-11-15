import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Vertexon LMS-AI
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              v1.0 Scaffold
            </span>
          </div>
          <nav className="flex space-x-6 text-sm font-medium text-slate-600">
            <a href="#student" className="hover:text-blue-600">Student Portal</a>
            <a href="#instructor" className="hover:text-blue-600">Instructor Studio</a>
            <a href="#admin" className="hover:text-blue-600">Admin Console</a>
            <a href="#ai-tutor" className="hover:text-blue-600">AI Tutor</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            AI-Augmented Learning Management System
          </h1>
          <p className="text-slate-600 text-lg mb-8 max-w-3xl">
            Welcome to the LMS-AI project workspace. Grounded RAG AI tutoring, personalized study plans,
            course authoring, and auto-generated quizzes are architected across three core modules.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 hover:border-blue-300 transition">
              <h2 className="text-xl font-bold text-slate-900 mb-2">🎓 Student Module</h2>
              <p className="text-sm text-slate-600 mb-4">
                Course catalog, video player with resume, timestamped notes, assignment upload, and certificates.
              </p>
              <span className="inline-block text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                P0 Ready
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 hover:border-blue-300 transition">
              <h2 className="text-xl font-bold text-slate-900 mb-2">🤖 AI Tutor & RAG</h2>
              <p className="text-sm text-slate-600 mb-4">
                Course-grounded doubt resolution, transcript summarization, flashcards, and adaptive explanations.
              </p>
              <span className="inline-block text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded">
                pgvector + LLM
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 hover:border-blue-300 transition">
              <h2 className="text-xl font-bold text-slate-900 mb-2">📊 Instructor & Admin</h2>
              <p className="text-sm text-slate-600 mb-4">
                Course creation, AI quiz approval, lecture drop-off analytics, and governance moderation.
              </p>
              <span className="inline-block text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded">
                RBAC Governed
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Vertexon Learning Technologies Pvt. Ltd. &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
