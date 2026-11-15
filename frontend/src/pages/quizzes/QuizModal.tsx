import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, CheckCircle2, AlertCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizModalProps {
  quizId: string;
  onClose: () => void;
  onComplete: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quizId, onClose, onComplete }) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/${quizId}`);
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error('Quiz loading failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: [optionId],
    }));
  };

  const handleSubmit = async () => {
    try {
      const payloadAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds,
      }));

      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: payloadAnswers });
      setResult(res.data.attempt);
      setSubmitted(true);
      if (res.data.attempt.passed) {
        onComplete();
      }
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-slate-900 text-white p-6 rounded-2xl">Loading Quiz...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-md">
            Interactive Assessment
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">{quiz.title}</h2>
          <p className="text-xs text-slate-400 mt-1">Passing requirement: 60% • Immediate auto-grading</p>
        </div>

        {/* Results Screen */}
        {submitted && result ? (
          <div className="text-center py-6">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-2xl font-black text-white">
              {result.passed ? '🎉 Congratulations! You Passed' : 'Keep Practicing!'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              You scored <span className="font-bold text-white">{result.score}</span> out of{' '}
              <span className="font-bold text-white">{result.maxScore}</span> ({result.percentage}%)
            </p>

            {/* Answer breakdown */}
            <div className="my-6 text-left space-y-3">
              {result.breakdown?.map((b: any, idx: number) => (
                <div
                  key={b.questionId}
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    b.isCorrect ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {b.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>Question {idx + 1}: {b.isCorrect ? 'Correct' : 'Incorrect choice'}</span>
                  </div>
                  <span className="text-[11px] font-mono">{b.isCorrect ? '+1 Pt' : '0 Pts'}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedAnswers({});
                  setResult(null);
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition"
              >
                Continue Course
              </button>
            </div>
          </div>
        ) : (
          /* Question Form */
          <div>
            <div className="space-y-6">
              {quiz.questions?.map((q: any, qIdx: number) => (
                <div key={q.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    <span className="text-blue-400 font-mono mr-2">0{qIdx + 1}.</span>
                    {q.questionText}
                  </h4>
                  <div className="space-y-2">
                    {q.options?.map((opt: any) => {
                      const isSelected = selectedAnswers[q.id]?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className={`w-full text-left p-3 rounded-xl text-xs flex items-center space-x-3 transition border ${
                            isSelected
                              ? 'bg-blue-600/30 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && '✓'}
                          </div>
                          <span>{opt.optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Answered: {Object.keys(selectedAnswers).length} / {quiz.questions?.length || 0}
              </span>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition"
              >
                Submit & Grade
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
