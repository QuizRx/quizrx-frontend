import React, { useState, useRef } from "react";

interface AvatarChatProps {
    isOpen: boolean;
    onClose: () => void;
}

import InteractiveLayout from "./avatar-interactive";
import { X } from "lucide-react"
export default function AvatarChat({ isOpen, onClose }: AvatarChatProps) {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    };

    const handleMouseUp = () => {
        setDragging(false);
        document.body.style.userSelect = "";
    };

    React.useEffect(() => {
        if (dragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);

    if (!isOpen) return null;

    return (
        <div
            className={[
                "fixed z-[1000] flex items-center justify-center cursor-grab p-3",
                dragging ? "cursor-grabbing" : "",
                "rounded-2xl border-2 border-gray-300 bg-white shadow-lg",
            ].join(" ")}
            style={{
                left: position.x,
                top: position.y,
                width: 200,
                height: 200,
            }}
            onMouseDown={handleMouseDown}
        >
            <InteractiveLayout />
        </div>
    );
}