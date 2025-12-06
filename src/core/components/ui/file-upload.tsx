import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/core/hooks/use-toast";
import { Plus } from "lucide-react";

export type FileUploadProps = {
  name: string;
  onChange: (files: File[]) => void;
  value?: File | File[] | null;
  maxFileSize?: number;
  isMultiple?: boolean;
  fileTypes?: Record<string, string>;
  className?: string;
  disabled?: boolean;
};

// Default file types
const defaultFileTypes: Record<string, string> = {
  pdf: "PDF",
  ppt: "PPT",
  pptx: "PPTX",
  doc: "DOC",
  docx: "DOCX",
  xls: "Excel",
  xlsx: "Excel",
  csv: "CSV",
  txt: "TXT",
};

// Default max file size in MB
const DEFAULT_MAX_FILE_SIZE_MB = 5;

const FileUpload = ({
  name,
  onChange,
  value,
  maxFileSize = DEFAULT_MAX_FILE_SIZE_MB,
  isMultiple = false,
  fileTypes = defaultFileTypes,
  className,
  disabled,
}: FileUploadProps) => {
  const { toast } = useToast();
  const files = Array.isArray(value) ? value : value ? [value] : [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert MB to bytes for internal file size validation
  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > maxFileSizeBytes) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `Maximum file size is ${maxFileSize.toFixed(1)} MB.`,
        });
        return false;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const isValidType = Object.keys(fileTypes).some(
        (type) => fileExtension === type.toLowerCase()
      );

      if (!isValidType) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a supported file type.",
        });
        return false;
      }

      return true;
    },
    [maxFileSize, fileTypes, toast]
  );

  const processFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter(validateFile);
      if (validFiles.length > 0) {
        onChange(isMultiple ? [...files, ...validFiles] : validFiles);
      }
    },
    [files, isMultiple, onChange, validateFile]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      processFiles(acceptedFiles);
      setIsDragging(false);
    },
    [processFiles]
  );

  const onDropRejected = useCallback(() => {
    setIsDragging(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: isMultiple,
    maxSize: maxFileSizeBytes,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
    },
    disabled,
  });

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center ${
        isDragging ? "border-dashed border-primary/50" : ""
      } ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      <input
        {...getInputProps()}
        ref={fileInputRef}
        name={name}
        disabled={disabled}
      />

      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground">
        <Plus className="h-5 w-5 text-foreground" />
      </div>

      <p className="text-sm mt-2">
        <span className="underline text-primary">Click here</span> to upload
        your files or drop.
      </p>

      <div className="mt-2 flex items-center justify-center space-x-1">
        <div className="flex items-center text-xs text-muted-foreground">
          <span>ⓘ</span>
          <span className="ml-1">
            Supported formats: {Object.values(fileTypes).join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
