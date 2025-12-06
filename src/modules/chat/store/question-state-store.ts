import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Question } from "../types/api/question";

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}
interface QuizResult {
  timeSpent: number;
  score: string;
  averageTimePerQuestion: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
}

export interface QuestionState {
  // Questions data
  isAnswered: boolean;
  questions: Question[];
  currentQuestionIndex: number;

  // Timer state
  totalTime: number;
  timeRemaining: number;
  isTimerRunning: boolean;

  // Answer state
  selectedAnswer: string | null;
  answeredQuestions: Set<string>;
  correctAnswers: number;

  // UI state
  showCitations: boolean;
  showExplanation: boolean;

  // Loading states
  isSaving: boolean;

  // Computed properties helpers
  currentQuestion: Question | null;
  isQuizCompleted: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;

  answers: Answer[];
  quizResult: QuizResult | null;
}

export interface QuestionActions {
  // Initialize quiz
  initializeQuiz: (questions: Question[], totalTime?: number) => void;
  showQuestion: (question: Question, totalTime?: number) => void;
  resetQuiz: () => void;

  // Navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;

  // Timer management
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimeRemaining: (time: number) => void;

  // Answer handling
  selectAnswer: (answer: string, updateQuestionMutation: any) => void;
  clearCurrentAnswer: () => void;

  // UI toggles
  toggleCitations: () => void;
  setCitationsVisible: (visible: boolean) => void;
  toggleExplanation: () => void;
  setExplanationVisible: (visible: boolean) => void;

  // Question management
  saveQuestion: (
    questionId: string,
    updateQuestionMutation: any
  ) => Promise<void>;
  updateQuestionInStore: (
    questionId: string,
    updates: Partial<Question>
  ) => void;

  // Utility functions
  getQuestionById: (questionId: string) => Question | undefined;
  getAnswerStatistics: () => {
    total: number;
    answered: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  };
  formatTime: (seconds: number) => string;
  getChoiceStyle: (choice: string, index: number) => string;
  isQuestionAnswered: (questionId: string) => boolean;
  setAnswer: (answer: Answer) => void;
  setAnswers: (newAnswers: Answer[]) => void;
  getProgressPercentage: () => number;
  setQuizResult: (result: QuizResult) => void; 
}

export type QuestionStore = QuestionState & QuestionActions;

const initialState: QuestionState = {
  isAnswered: false,
  questions: [],
  currentQuestionIndex: 0,
  totalTime: 300,
  timeRemaining: 300,
  isTimerRunning: false,
  selectedAnswer: null,
  answeredQuestions: new Set(),
  correctAnswers: 0,
  showCitations: false,
  showExplanation: false,
  isSaving: false,
  currentQuestion: null,
  isQuizCompleted: false,
  canGoNext: false,
  canGoPrevious: false,
  answers: [],
  quizResult: null,
};

export const useQuestionStore = create<QuestionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setQuizResult: (result: QuizResult) => {
        set({ quizResult: result, currentQuestionIndex: 0 });
      },
      // Initialize quiz
      initializeQuiz: (questions: Question[], totalTime = 300) => {
        set({
          questions,
          totalTime,
          timeRemaining: totalTime,
          currentQuestionIndex: 0,
          selectedAnswer: null,
          answeredQuestions: new Set(),
          correctAnswers: 0,
          showCitations: false,
          showExplanation: false,
          isTimerRunning: true,
          currentQuestion: questions[0] || null,
          isQuizCompleted: false,
          canGoNext: questions.length > 1,
          canGoPrevious: false,
          answers: [],
          quizResult: null,
        });
      },

      showQuestion: (question: Question, totalTime = 300) => {
        set({
          questions: [question],
          isAnswered: true,
          totalTime,
          timeRemaining: question.timeSpent ? totalTime - question.timeSpent : 0,
          currentQuestionIndex: 0,
          // it is a number but i need to get it like A, B, C, D A=0, B=1, C=2, D=3
          selectedAnswer: typeof question.userChoice === "number" ? String.fromCharCode(65 + question.userChoice) : null,
          answeredQuestions: new Set(),
          correctAnswers: question.isUserAnswerCorrect ? 1 : 0,
          showCitations: false,
          showExplanation: false,
          isTimerRunning: false,
          currentQuestion: question || null,
          isQuizCompleted: true,
          canGoNext: false,
          canGoPrevious: false,
        });
      },

      resetQuiz: () => {
        set(initialState);
      },

      // Navigation
      goToNextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          const newIndex = currentQuestionIndex + 1;
          set({
            currentQuestionIndex: newIndex,
            selectedAnswer: null,
            showExplanation: false,
            currentQuestion: questions[newIndex],
            canGoNext: newIndex < questions.length - 1,
            canGoPrevious: newIndex > 0,
            isQuizCompleted: newIndex === questions.length - 1,
          });
        }
      },

      goToPreviousQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex > 0) {
          const newIndex = currentQuestionIndex - 1;
          set({
            currentQuestionIndex: newIndex,
            selectedAnswer: null,
            showExplanation: false,
            currentQuestion: questions[newIndex],
            canGoNext: newIndex < questions.length - 1,
            canGoPrevious: newIndex > 0,
            isQuizCompleted: false,
          });
        }
      },

      goToQuestion: (index: number) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({
            currentQuestionIndex: index,
            selectedAnswer: null,
            showExplanation: false,
            currentQuestion: questions[index],
            canGoNext: index < questions.length - 1,
            canGoPrevious: index > 0,
            isQuizCompleted: index === questions.length - 1,
          });
        }
      },

      // Timer management
      startTimer: () => {
        set({ isTimerRunning: true });
      },

      pauseTimer: () => {
        set({ isTimerRunning: false });
      },

      resetTimer: () => {
        const { totalTime } = get();
        set({
          timeRemaining: totalTime,
          isTimerRunning: false,
        });
      },

            setTimeRemaining: (time: number) => {
        set({
          timeRemaining: time,
          isTimerRunning: time > 0,
        });
      },

      // Answer handling
      selectAnswer: async (answer: string, updateQuestionMutation: any) => {
        const { currentQuestion, answeredQuestions, correctAnswers, totalTime, timeRemaining } = get();

        if (!currentQuestion) return;

        // Debug logging - remove this in production
        console.log("Selected answer:", answer);
        console.log("Current question answer:", currentQuestion.answer);
        console.log("Question choices:", currentQuestion.choices);
        console.log("Total time:", totalTime);
        console.log("Time remaining:", timeRemaining);

        set({ selectedAnswer: answer, showExplanation: true, isTimerRunning: false });

        // Mark question as answered if not already
        if (!answeredQuestions.has(currentQuestion._id)) {
          const newAnsweredQuestions = new Set(answeredQuestions);
          newAnsweredQuestions.add(currentQuestion._id);

          // Convert selected letter to choice index and get the corresponding choice text
          const selectedLetter = answer.toUpperCase().trim();
          const choiceIndex = selectedLetter.charCodeAt(0) - 65; // Convert A=0, B=1, C=2, D=3
          const selectedChoiceText = currentQuestion.choices[choiceIndex];

          // Compare the selected choice text with the correct answer text
          const isCorrectAnswer = selectedChoiceText === currentQuestion.answer;

          const questionId = currentQuestion._id;

          await updateQuestionMutation({
            variables: {
              updateQuestionInput: {
                userChoice: choiceIndex,
                isUserAnswerCorrect: isCorrectAnswer,
                timeSpent: totalTime - timeRemaining,
                questionId,
              },
            },
          });

          console.log("Selected choice text:", selectedChoiceText);
          console.log("Correct answer text:", currentQuestion.answer);
          console.log("Is correct?", isCorrectAnswer);

          const newCorrectAnswers = isCorrectAnswer
            ? correctAnswers + 1
            : correctAnswers;

          set({
            answeredQuestions: newAnsweredQuestions,
            correctAnswers: newCorrectAnswers,
          });
        }
      },

      clearCurrentAnswer: () => {
        set({ selectedAnswer: null, showExplanation: false });
      },

      // UI toggles
      toggleCitations: () => {
        set((state) => ({ showCitations: !state.showCitations }));
      },

      setCitationsVisible: (visible: boolean) => {
        set({ showCitations: visible });
      },

      toggleExplanation: () => {
        set((state) => ({ showExplanation: !state.showExplanation }));
      },

      setExplanationVisible: (visible: boolean) => {
        set({ showExplanation: visible });
      },

      // Question management
      saveQuestion: async (questionId: string, updateQuestionMutation: any) => {
        set({ isSaving: true });
        try {
          await updateQuestionMutation({
            variables: {
              updateQuestionInput: {
                isSaved: true,
                questionId,
              },
            },
          });

          // Update local state
          get().updateQuestionInStore(questionId, { isSaved: true });
        } catch (error) {
          console.error("Error saving question:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      updateQuestionInStore: (
        questionId: string,
        updates: Partial<Question>
      ) => {
        const { questions, currentQuestionIndex } = get();
        const updatedQuestions = questions.map((q) =>
          q._id === questionId ? { ...q, ...updates } : q
        );

        set({
          questions: updatedQuestions,
          currentQuestion: updatedQuestions[currentQuestionIndex],
        });
      },

      // Utility functions
      getQuestionById: (questionId: string) => {
        const { questions } = get();
        return questions.find((q) => q._id === questionId);
      },

      getAnswerStatistics: () => {
        const { questions, answeredQuestions, correctAnswers } = get();
        const total = questions.length;
        const answered = answeredQuestions.size;
        const correct = correctAnswers;
        const incorrect = answered - correct;
        const accuracy = answered > 0 ? (correct / answered) * 100 : 0;

        return {
          total,
          answered,
          correct,
          incorrect,
          accuracy: Math.round(accuracy * 100) / 100,
        };
      },

      formatTime: (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
          .toString()
          .padStart(2, "0")}`;
      },

      getChoiceStyle: (choice: string, index: number) => {
        const { selectedAnswer, currentQuestion } = get();

        if (!selectedAnswer || !currentQuestion) return "";

        const choiceLetter = String.fromCharCode(65 + index); // Convert index to letter (0->A, 1->B, etc.)
        const isSelected =
          selectedAnswer.toUpperCase() === choiceLetter.toUpperCase();

        // Convert correct answer text back to letter for comparison
        const correctChoiceIndex = currentQuestion.choices.findIndex(
          (c) => c === currentQuestion.answer
        );
        const correctChoiceLetter = String.fromCharCode(
          65 + correctChoiceIndex
        );
        const isCorrect =
          choiceLetter.toUpperCase() === correctChoiceLetter.toUpperCase();

        if (isSelected && isCorrect) {
          return "bg-green-50 border-green-500";
        } else if (isSelected && !isCorrect) {
          return "bg-red-50 border-red-500";
        } else if (!isSelected && isCorrect) {
          return "bg-green-50 border-green-500";
        }
        return "";
      },

      isQuestionAnswered: (questionId: string) => {
        const { answeredQuestions } = get();
        return answeredQuestions.has(questionId);
      },
            setAnswer: (newAnswer: Answer) => {
        set((state) => {
          const index = state.answers.findIndex(
            (a) => a.questionId === newAnswer.questionId
          );

          // ✅ Prevent unnecessary update
          const existing = state.answers[index];
          const isSame =
            index !== -1 &&
            existing.answer === newAnswer.answer &&
            existing.isCorrect === newAnswer.isCorrect;

          if (isSame) return {}; // 🛑 No state change → no re-render

          const updated = [...state.answers];
          if (index !== -1) {
            updated[index] = newAnswer;
          } else {
            updated.push(newAnswer);
          }

          return { answers: updated };
        });
      },

      setAnswers: (newAnswers: Answer[]) => {
        set((state) => {
          const isSame =
            state.answers.length === newAnswers.length &&
            state.answers.every(
              (a, i) =>
                a.questionId === newAnswers[i].questionId &&
                a.answer === newAnswers[i].answer &&
                a.isCorrect === newAnswers[i].isCorrect
            );

          if (isSame) return {}; // 🛑 avoid update loop

          return { answers: newAnswers };
        });
      },

      // Computed getter for progress percentage
      getProgressPercentage: () => {
        const { questions, answers } = get();
        return questions.length > 0
          ? Math.round((answers.length / questions.length) * 100)
          : 0;
      },
    }),
    {
      name: "question-store",
    }
  )
);
