"use client";

import { toast } from "@/core/hooks/use-toast";
import { FileUploadProps, ImageMetadata } from "@/core/types/ui/image";
import React, { ChangeEvent,  useState } from "react";
import { FormControl, FormItem } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import ImagePreviewDialog from "./dialog/image-preview";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { SquarePen } from "lucide-react";

export const ProfileImageUpload = ({
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  showSaveButton,
  onSave,
  userName,
  fileInputRef,
  setSelectedFile,
  onRemove,
}: FileUploadProps & {
  showSaveButton?: boolean;
  onSave?: () => void;
  userName?: string;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  setSelectedFile?: (file: File | null) => void;
  onRemove?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    typeof value === "string" ? value : undefined
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const dimensions = await getImageDimensions(file);

      setMetadata({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        dimensions,
      });

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onChange(objectUrl);
      setSelectedFile?.(file);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Could not process the image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onBlur?.();
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleCancel = () => {
    onChange("");
    setMetadata(null);
    setPreviewOpen(false);
    setPreviewUrl(undefined);
    setSelectedFile?.(null);
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onBlur?.();
  };

  const triggerFileInput = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayValue = previewUrl || (typeof value === "string" ? value : defaultValue);

  return (
    <FormItem>
      <FormControl>
        <div className="relative w-fit">
          <Avatar
            className="h-16 w-16 cursor-pointer"
            onClick={() => setPreviewOpen(true)}
          >
            <AvatarImage
              src={
                displayValue ||
                "/default-avatar.png"
              }
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
            <AvatarFallback>
              {userName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute bottom-0 -right-2 p-0 shadow cursor-pointer z-20 bg-white rounded-full"
            style={{ overflow: "visible" }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            title="Change photo"
          >
            <SquarePen className="w-5 h-5 text-blue-600" strokeWidth={3} />
          </span>
          <Input
            ref={fileInputRef}
            type="file"
            id={name}
            name={name}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </FormControl>
      <ImagePreviewDialog
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        value={displayValue}
        metadata={metadata}
        triggerFileInput={triggerFileInput}
        handleCancel={handleCancel}
        showSaveButton={showSaveButton}
        onSave={onSave}
        isLoading={isLoading}
        onRemove={onRemove}
      />
    </FormItem>
  );
};
