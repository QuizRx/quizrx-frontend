"use client";

import { FileIcon, Trash2 } from "lucide-react";
import React from "react";

interface FileCardProps {
  file: File;
  onRemove?: () => void;
}

// Format file size helper
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(2) + " MB";
};

const FileCard = ({ file, onRemove }: FileCardProps) => {
  return (
    <div className="flex items-start p-4 border border-muted rounded-lg bg-card">
      <div className="flex-shrink-0 p-2 mr-3 bg-primary/10 rounded-md">
        <FileIcon className="h-6 w-6 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 ml-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          title="Remove file"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default FileCard;
