import React from "react";

interface PlacedAvatarProps {
  question: any;
  onClose: () => void;
  occupySpace?: boolean;
}

export default function PlacedAvatar({ question, onClose, occupySpace = false }: PlacedAvatarProps) {
  // If occupySpace, render a placeholder div to reserve space
  return (
    <>
      {occupySpace && (
        <div className="w-full h-[40px]" />
      )}
      <div
        className="sticky top-0 left-0 right-0 h-[180px] z-10 bg-white border-2 border-gray-300 rounded-2xl shadow-lg flex items-center justify-center p-5 mt-5 mx-5"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 bg-transparent border-none text-xl cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
        {/* Avatar or content can go here */}
      </div>
    </>
  );
}
