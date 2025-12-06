import { create } from "zustand";

interface QuestionContext {
  question?: string;
  answer?: string;
  explanation?: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  reviewContent?: string;
}

interface AvatarState {
  isAvatarVisible: boolean;
  talkFunction: ((text: string, mode?: "repeat" | "chat") => Promise<void>) | null;
  questionContext: QuestionContext | null;
  showAvatar: () => void;
  hideAvatar: () => void;
  toggleAvatar: () => void;
  setTalkFunction: (fn: ((text: string, mode?: "repeat" | "chat") => Promise<void>) | null) => void;
  talk: (text: string, mode?: "repeat" | "chat") => Promise<void>;
  showAvatarWithContext: (context: QuestionContext) => void;
  setQuestionContext: (context: QuestionContext | null) => void;
  getContextualPrompt: () => string;
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  isAvatarVisible: false,
  talkFunction: null,
  questionContext: null,
  showAvatar: () => set({ isAvatarVisible: true }),
  hideAvatar: () => set({ isAvatarVisible: false, questionContext: null }),
  toggleAvatar: () => set((state) => ({ 
    isAvatarVisible: !state.isAvatarVisible,
    questionContext: !state.isAvatarVisible ? null : state.questionContext 
  })),
  setTalkFunction: (fn) => set({ talkFunction: fn }),
  setQuestionContext: (context) => set({ questionContext: context }),
  showAvatarWithContext: (context: QuestionContext) => {
    set({ 
      isAvatarVisible: true, 
      questionContext: context 
    });
  },
  getContextualPrompt: () => {
    const { questionContext } = get();
    if (!questionContext) return "";
    
    let prompt = "";
    
    if (questionContext.question) {
      prompt += `"${questionContext.question}" `;
    }
    
    if (questionContext.selectedAnswer && questionContext.isCorrect !== undefined) {
      if (questionContext.isCorrect) {
        prompt += `You got it right with "${questionContext.selectedAnswer}". `;
      } else {
        prompt += `You chose "${questionContext.selectedAnswer}" but the correct answer is "${questionContext.answer}". `;
      }
    } else if (questionContext.answer) {
      prompt += `The answer is "${questionContext.answer}". `;
    }
    
    if (questionContext.explanation) {
      prompt += `${questionContext.explanation} `;
    }
    
    if (questionContext.reviewContent) {
      prompt += `${questionContext.reviewContent} `;
    }
    
    return prompt.trim();
  },
  talk: async (text: string, mode: "repeat" | "chat" = "chat") => {
    const { isAvatarVisible, talkFunction } = get();
    if (isAvatarVisible && talkFunction) {
      await talkFunction(text, mode);
    }
  },
}));
