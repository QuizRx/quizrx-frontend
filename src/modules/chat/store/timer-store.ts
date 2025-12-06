import { useEffect } from "react";
import { useQuestionStore } from "../store/question-state-store";

/**
 * Custom hook to handle timer functionality
 * Automatically manages the countdown timer based on store state
 */
export const useTimer = () => {
  const { timeRemaining, isTimerRunning, setTimeRemaining, pauseTimer } =
    useQuestionStore();

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
