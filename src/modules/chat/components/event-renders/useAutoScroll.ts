import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for intelligent auto-scrolling behavior
 * - Auto-scrolls to bottom when new content is added
 * - Disables auto-scroll when user scrolls up manually
 * - Re-enables when user scrolls back to bottom
 */
export const useAutoScroll = (content: string, isActive?: boolean) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const lastContentLengthRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  // Handle user scroll
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (isUserScrollingRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

      // If user scrolled away from bottom, disable auto-scroll
      if (!isNearBottom && autoScrollEnabled) {
        setAutoScrollEnabled(false);
      }
      // If user scrolled back to bottom, enable auto-scroll
      else if (isNearBottom && !autoScrollEnabled) {
        setAutoScrollEnabled(true);
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [autoScrollEnabled]);

  // Auto-scroll when content changes
  useEffect(() => {
    const element = contentRef.current;
    if (!element || !autoScrollEnabled || !isActive) return;

    // Only scroll if content actually increased
    const currentLength = content.length;
    if (currentLength > lastContentLengthRef.current) {
      isUserScrollingRef.current = true;
      
      // Smooth scroll to bottom
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });

      // Re-enable user scroll detection after animation
      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 300);
    }

    lastContentLengthRef.current = currentLength;
  }, [content, autoScrollEnabled, isActive]);

  // Reset when content changes significantly (new event)
  useEffect(() => {
    if (content.length < lastContentLengthRef.current) {
      setAutoScrollEnabled(true);
      lastContentLengthRef.current = 0;
    }
  }, [content.length]);

  return { contentRef, autoScrollEnabled };
};

