import { useEffect } from "react";
import { getIndividualQuestionStore } from "./individual-question-store";

/**
 * Custom hook to handle timer functionality for individual questions
 * Each question gets its own timer instance
 */
export const useIndividualTimer = (questionId: string) => {
  const store = getIndividualQuestionStore(questionId);
  const { timeRemaining, isTimerRunning, setTimeRemaining, pauseTimer } = store();

  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        pauseTimer();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining, setTimeRemaining, pauseTimer]);

  return {
    timeRemaining,
    isTimerRunning,
  };
};

/**
 * Hook to get the store instance for a specific question
 */
export const useIndividualQuestionStore = (questionId: string) => {
  return getIndividualQuestionStore(questionId);
};
