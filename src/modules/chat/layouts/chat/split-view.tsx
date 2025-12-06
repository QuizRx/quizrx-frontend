"use client";

import { useState, useRef, useCallback, ReactNode, useEffect } from "react";
import { ChevronLeft, ChevronRight, CylinderIcon, Hand } from "lucide-react";

interface SplitViewProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  minLeftWidth?: number;
  minRightWidth?: number;
  defaultLeftWidth?: number;
}

export const SplitView = ({
  leftContent,
  rightContent,
  isOpen,
  onToggle,
  minLeftWidth = 300,
  minRightWidth = 300,
  defaultLeftWidth = 60, // percentage
}: SplitViewProps) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.classList.add('select-none-during-drag');
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      e.preventDefault();
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Calculate minimum widths as percentages
      const minLeftPercent = (minLeftWidth / containerRect.width) * 100;
      const minRightPercent = (minRightWidth / containerRect.width) * 100;

      // Constrain the width
      const constrainedWidth = Math.max(
        minLeftPercent,
        Math.min(100 - minRightPercent, newLeftWidth)
      );

      setLeftWidth(constrainedWidth);
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('select-none-during-drag');
  }, []);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) {
    return <div className="w-full h-full overflow-y-auto split-panel-scroll">{leftContent}</div>;
  }

  return (
    <div ref={containerRef} className="flex w-full h-full relative">
      {/* Left Panel */}
      <div
        className="flex-shrink-0 overflow-y-auto split-panel-scroll border-r"
        style={{ width: `${leftWidth}%` }}
      >
        {leftContent}
      </div>

      {/* Draggable Divider */}
      <div
        className={`w-[0.5px] bg-blue-200 hover:bg-primary/20 cursor-col-resize relative group flex-shrink-0 split-transition ${
          isDragging ? "bg-primary/30" : ""
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Draggable handle */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-[0.5px] bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors" />
        
        {/* Collapse button */}
        <button
          onClick={onToggle}
          className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-background border rounded-full p-1 opacity-100 group-hover:opacity-100 transition-opacity hover:bg-muted z-10 shadow-sm"
          title="Close split view"
        >
          <Hand size={12} />
        </button>
      </div>

      {/* Right Panel */}
      <div className="flex-1 overflow-y-auto split-panel-scroll relative">
        {/* Close button for right panel */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 bg-background border rounded-full p-2 hover:bg-muted z-10 shadow-sm"
          title="Close review panel"
        >
          <ChevronLeft size={16} />
        </button>
        {rightContent}
      </div>
    </div>
  );
};