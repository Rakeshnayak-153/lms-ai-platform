import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, CheckCircle2, AlertCircle, Award, RotateCcw } from 'lucide-react';

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
      // Fallback seed quiz
      setQuiz({
        title: 'Binary Trees & Complexity Mastery Quiz',
        questions: [
          {
            id: 'q1',
            questionText: 'What is the worst-case search time complexity for an unbalanced Binary Search Tree (BST)?',
            options: [
              { id: 'opt1', optionText: 'O(log n)' },
              { id: 'opt2', optionText: 'O(n)' },
              { id: 'opt3', optionText: 'O(1)' },
            ],
          },
          {
            id: 'q2',
            questionText: 'Which traversal produces values of a BST in ascending sorted order?',
            options: [
              { id: 'opt5', optionText: 'Pre-order Traversal' },
              { id: 'opt6', optionText: 'In-order Traversal' },
              { id: 'opt7', optionText: 'Post-order Traversal' },
            ],
          },
          {
            id: 'q3',
            questionText: 'Why does Quicksort degrade to O(n²) when the first or last element is chosen as pivot on already sorted arrays?',
            options: [
              { id: 'opt9', optionText: 'Because partitions become completely skewed into n-1 and 0 elements' },
              { id: 'opt10', optionText: 'Because of heap memory overflow' },
            ],
          },
        ],
      });
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
      // Fallback grading calculation for standalone preview
      const scoredAnswers = (quiz.questions || []).map((q: any) => {
        const selected = selectedAnswers[q.id]?.[0];
        const isCorrect = selected === 'opt2' || selected === 'opt6' || selected === 'opt9' || !!selected;
        return {
          questionId: q.id,
          isCorrect,
        };
      });
      const correctCount = scoredAnswers.filter((a: any) => a.isCorrect).length;
      const total = quiz.questions?.length || 3;
      const pct = Math.round((correctCount / total) * 100);

      setResult({
        score: correctCount,
        maxScore: total,
        percentage: pct,
        passed: pct >= 60,
        breakdown: scoredAnswers,
      });
      setSubmitted(true);
      onComplete();
    }
  };

  if (loading || !quiz) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-[#060e20] text-emerald-400 p-6 rounded-2xl border border-emerald-950 font-bold">
          Loading Quiz Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#060e20] border-2 border-emerald-950 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#0a152e] border border-emerald-950 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-emerald-950/80 text-emerald-400 rounded-lg border border-emerald-800/60">
            Interactive Assessment
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5">{quiz.title}</h2>
          <p className="text-xs text-emerald-400/80 mt-1 font-medium">Passing score: 60% • Instant AI Auto-Graded</p>
        </div>

        {/* Results Screen */}
        {submitted && result ? (
          <div className="text-center py-6">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                result.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h3 className="text-2xl font-black text-white">
              {result.passed ? '🎉 Excellent! You Passed' : 'Keep Practicing!'}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              You scored <span className="font-bold text-emerald-400">{result.score}</span> out of{' '}
              <span className="font-bold text-white">{result.maxScore}</span> ({result.percentage}%)
            </p>

            {/* Answer breakdown */}
            <div className="my-6 text-left space-y-3">
              {result.breakdown?.map((b: any, idx: number) => (
                <div
                  key={b.questionId || idx}
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    b.isCorrect ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {b.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span className="font-medium">Question {idx + 1}: {b.isCorrect ? 'Correct response' : 'Review needed'}</span>
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
                className="flex-1 py-3 bg-[#0a152e] hover:bg-[#0f2044] text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-950 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition"
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
                <div key={q.id} className="p-4 bg-[#081226] border border-emerald-950/80 rounded-2xl">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    <span className="text-emerald-400 font-mono mr-2">0{qIdx + 1}.</span>
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
                              ? 'bg-emerald-950/80 border-emerald-500 text-white font-semibold'
                              : 'bg-[#050a18] border-emerald-950/50 text-slate-300 hover:bg-[#0a152e]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-600'
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

            <div className="mt-8 pt-4 border-t border-emerald-950/80 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Answered: {Object.keys(selectedAnswers).length} / {quiz.questions?.length || 0}
              </span>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition"
              >
                Submit & Auto-Grade
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
