/**
 * Example Usage of the Unified useStreamingAvatarSession Hook
 * 
 * This hook now supports two modes:
 * 1. Chapter mode - for learning specific chapters with knowledge base
 * 2. Explanation mode - for explaining specific content/questions
 */

import useStreamingAvatarSession from "@/modules/avatars/hooks/use-streaming-avatar-session";
import useChapterSelection from "@/modules/avatars/hooks/use-chapter-selection";

// Example 1: Chapter Mode Usage (for main avatar interactions)
function ChapterAvatarExample() {
  const { startSession, stopSession, speak } = useStreamingAvatarSession();
  const { selectedChapter, selectedKnowledgeId, selectChapter } = useChapterSelection();

  const startChapterSession = () => {
    startSession({
      mode: 'chapter',
      chapterKnowledgeId: selectedKnowledgeId, // Uses the selected chapter's knowledge base
    });
  };

  const selectNewChapter = () => {
    selectChapter("Thyroid Disorders", "some-other-knowledge-id");
  };

  return (
    <div>
      <h2>Chapter Mode Example</h2>
      <p>Selected Chapter: {selectedChapter}</p>
      <button onClick={selectNewChapter}>Select Thyroid Chapter</button>
      <button onClick={startChapterSession}>Start Chapter Session</button>
      <button onClick={stopSession}>Stop Session</button>
    </div>
  );
}

// Example 2: Explanation Mode Usage (for question explanations)
function ExplanationAvatarExample({ question }: { question: any }) {
  const { startSession, stopSession, speak } = useStreamingAvatarSession();

  const startExplanationSession = () => {
    let explanationContent = '';
    if (typeof question.explanation === 'string') {
      explanationContent = question.explanation;
    } else {
      explanationContent = `Correct answer: ${question.explanation.correct_answer.explanation}`;
    }
    
    const explanationText = `Your goal is to help the user understand the question. 
      This is the explanation: ${explanationContent}, 
      this is the question: ${question.question}, 
      this is the answer: ${question.answer}, 
      this is the topic: ${question.topic}, 
      these are the choices the user had: ${question.choices.join(", ")}`;
    
    startSession(
      {
        mode: 'explanation',
        explanationText: explanationText,
      },
      explanationText // This will be spoken immediately after avatar starts
    );
  };

  const explainAgain = () => {
    let explanationContent = '';
    if (typeof question.explanation === 'string') {
      explanationContent = question.explanation;
    } else {
      explanationContent = `Correct answer: ${question.explanation.correct_answer.explanation}`;
    }
    const explanationText = `Let me explain this again: ${explanationContent}`;
    speak(explanationText, "chat");
  };

  return (
    <div>
      <h2>Explanation Mode Example</h2>
      <p>Question: {question.question}</p>
      <button onClick={startExplanationSession}>Start Explanation</button>
      <button onClick={explainAgain}>Explain Again</button>
      <button onClick={stopSession}>Stop Session</button>
    </div>
  );
}

export { ChapterAvatarExample, ExplanationAvatarExample };
