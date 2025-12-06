import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Question } from "../types/api/question";

export interface IndividualQuestionState {
  // Question data
  question: Question | null;
  questionId: string | null;
  
  // Timer state
  totalTime: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  
  // Answer state
  selectedAnswer: string | null;
  isAnswered: boolean;
  
  // UI state
  showCitations: boolean;
  showExplanation: boolean;
  
  // Loading states
  isSaving: boolean;
}

export interface IndividualQuestionActions {
  // Initialize question
  initializeQuestion: (question: Question, totalTime?: number) => void;
  showQuestion: (question: Question, totalTime?: number) => void;
  resetQuestion: () => void;
  
  // Timer management
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimeRemaining: (time: number) => void;
  
  // Answer handling
  selectAnswer: (answer: string, updateQuestionMutation: any) => void;
  clearAnswer: () => void;
  
  // UI toggles
  toggleCitations: () => void;
  setCitationsVisible: (visible: boolean) => void;
  toggleExplanation: () => void;
  setExplanationVisible: (visible: boolean) => void;
  
  // Question management
  saveQuestion: (updateQuestionMutation: any) => Promise<void>;
  
  // Utility functions
  formatTime: (seconds: number) => string;
  getChoiceStyle: (choice: string, index: number) => string;
}

export type IndividualQuestionStore = IndividualQuestionState & IndividualQuestionActions;

const createInitialState = (): IndividualQuestionState => ({
  question: null,
  questionId: null,
  totalTime: 90,
  timeRemaining: 90,
  isTimerRunning: false,
  selectedAnswer: null,
  isAnswered: false,
  showCitations: false,
  showExplanation: false,
  isSaving: false,
});

export const createIndividualQuestionStore = (questionId: string) => {
  return create<IndividualQuestionStore>()(
    devtools(
      (set, get) => ({
        ...createInitialState(),
        questionId,

        // Initialize question for active answering
        initializeQuestion: (question: Question, totalTime = 90) => {
          set({
            question,
            totalTime,
            timeRemaining: totalTime,
            selectedAnswer: null,
            isAnswered: false,
            showCitations: false,
            showExplanation: false,
            isTimerRunning: true,
            isSaving: false,
          });
        },

        // Show question for review (already answered)
        showQuestion: (question: Question, totalTime = 90) => {
          set({
            question,
            totalTime,
            timeRemaining: question.timeSpent ? totalTime - question.timeSpent : 0,
            selectedAnswer: typeof question.userChoice === "number" 
              ? String.fromCharCode(65 + question.userChoice) 
              : null,
            isAnswered: true,
            showCitations: false,
            showExplanation: false,
            isTimerRunning: false,
            isSaving: false,
          });
        },

        resetQuestion: () => {
          set(createInitialState());
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
          const { question, totalTime, timeRemaining } = get();

          if (!question) return;

          console.log("Individual Question - Selected answer:", answer);
          console.log("Individual Question - Current question answer:", question.answer);

          set({ 
            selectedAnswer: answer, 
            showExplanation: true, 
            isTimerRunning: false,
            isAnswered: true 
          });

          // Convert selected letter to choice index and get the corresponding choice text
          const selectedLetter = answer.toUpperCase().trim();
          const choiceIndex = selectedLetter.charCodeAt(0) - 65; // Convert A=0, B=1, C=2, D=3
          const selectedChoiceText = question.choices[choiceIndex];

          // Compare the selected choice text with the correct answer text
          const isCorrectAnswer = selectedChoiceText === question.answer;

          try {
            await updateQuestionMutation({
              variables: {
                updateQuestionInput: {
                  userChoice: choiceIndex,
                  isUserAnswerCorrect: isCorrectAnswer,
                  timeSpent: totalTime - timeRemaining,
                  questionId: question._id,
                },
              },
            });

            console.log("Individual Question - Selected choice text:", selectedChoiceText);
            console.log("Individual Question - Correct answer text:", question.answer);
            console.log("Individual Question - Is correct?", isCorrectAnswer);

            // Update the question object with the new answer data
            set({
              question: {
                ...question,
                userChoice: choiceIndex,
                isUserAnswerCorrect: isCorrectAnswer,
                timeSpent: totalTime - timeRemaining,
              }
            });

          } catch (error) {
            console.error("Error updating question:", error);
          }
        },

        clearAnswer: () => {
          set({ selectedAnswer: null, showExplanation: false, isAnswered: false });
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
        saveQuestion: async (updateQuestionMutation: any) => {
          const { question } = get();
          if (!question) return;

          set({ isSaving: true });
          try {
            await updateQuestionMutation({
              variables: {
                updateQuestionInput: {
                  isSaved: true,
                  questionId: question._id,
                },
              },
            });

            // Update local question state
            set({
              question: { ...question, isSaved: true },
            });
          } catch (error) {
            console.error("Error saving question:", error);
            throw error;
          } finally {
            set({ isSaving: false });
          }
        },

        // Utility functions
        formatTime: (seconds: number) => {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
        },

        getChoiceStyle: (choice: string, index: number) => {
          const { selectedAnswer, question } = get();

          if (!selectedAnswer || !question) return "";

          const choiceLetter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer.toUpperCase() === choiceLetter.toUpperCase();

          // Convert correct answer text back to letter for comparison
          const correctChoiceIndex = question.choices.findIndex(
            (c) => c === question.answer
          );
          const correctChoiceLetter = String.fromCharCode(65 + correctChoiceIndex);
          const isCorrect = choiceLetter.toUpperCase() === correctChoiceLetter.toUpperCase();

          if (isSelected && isCorrect) {
            return "bg-green-50 border-green-500";
          } else if (isSelected && !isCorrect) {
            return "bg-red-50 border-red-500";
          } else if (!isSelected && isCorrect) {
            return "bg-green-50 border-green-500";
          }
          return "";
        },
      }),
      {
        name: `individual-question-store-${questionId}`,
      }
    )
  );
};

// Store registry to manage multiple question stores
const questionStores = new Map<string, ReturnType<typeof createIndividualQuestionStore>>();

export const getIndividualQuestionStore = (questionId: string) => {
  if (!questionStores.has(questionId)) {
    questionStores.set(questionId, createIndividualQuestionStore(questionId));
  }
  return questionStores.get(questionId)!;
};

// Cleanup function to remove stores when questions are no longer needed
export const cleanupQuestionStore = (questionId: string) => {
  questionStores.delete(questionId);
};

// Get all active question stores (useful for debugging)
export const getAllQuestionStores = () => {
  return Array.from(questionStores.entries());
};
