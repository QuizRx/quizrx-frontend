import { useState, useCallback } from "react";

export default function useChapterSelection() {
  const [selectedChapter, setSelectedChapter] = useState(() => {
    // Try to get persisted chapter from sessionStorage during development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const stored = sessionStorage.getItem('selectedChapter');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to restore selected chapter:", error);
      }
    }
    return "Review Assistant";
  });

  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState(() => {
    // Try to get persisted knowledgeId from sessionStorage during development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const stored = sessionStorage.getItem('selectedKnowledgeId');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to restore selected knowledgeId:", error);
      }
    }
    return "2ff4f19c833546a5931e7491f3d67c4f";
  });

  const selectChapter = useCallback((chapter: string, knowledgeId?: string) => {
    console.log("=== selectChapter Debug ===");
    console.log("Chapter parameter:", chapter);
    console.log("KnowledgeId parameter:", knowledgeId);
    console.log("Previous selected chapter:", selectedChapter);
    console.log("Previous selected knowledgeId:", selectedKnowledgeId);
    
    // Update selected chapter
    setSelectedChapter(chapter);
    
    // Determine which knowledgeId to use
    const finalKnowledgeId = knowledgeId || "2ff4f19c833546a5931e7491f3d67c4f";
    setSelectedKnowledgeId(finalKnowledgeId);
    
    console.log("Final knowledgeId to use:", finalKnowledgeId);
    
    // Persist to sessionStorage during development to survive Hot Refresh
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        sessionStorage.setItem('selectedChapter', JSON.stringify(chapter));
        sessionStorage.setItem('selectedKnowledgeId', JSON.stringify(finalKnowledgeId));
        console.log("Persisted config to sessionStorage");
      } catch (error) {
        console.warn("Failed to persist config:", error);
      }
    }
    
    console.log("Chapter selected:", chapter);
    console.log("Knowledge ID set to:", finalKnowledgeId);
    console.log("=== End selectChapter Debug ===");
  }, [selectedChapter, selectedKnowledgeId]);

  return {
    selectedChapter,
    selectedKnowledgeId,
    selectChapter,
  };
}
