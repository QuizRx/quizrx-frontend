"use client";

import { ImagePreviewDialogProps } from "@/core/types/ui/image";
import {
  Clock,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";

const ImagePreviewDialog = ({
  previewOpen,
  setPreviewOpen,
  value,
  metadata,
  triggerFileInput,
  handleCancel,
  onSave,
  showSaveButton,
  isLoading, // new prop
  onRemove,
}: ImagePreviewDialogProps & { isLoading?: boolean; onRemove?: () => void }) => {
  const [localBlur, setLocalBlur] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setLocalBlur(true);
    } else {
      setTimeout(() => setLocalBlur(false), 500);
    }
  }, [isLoading]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/default-avatar.png";
    toast({
      title: "Image load failed",
      description: "Showing default avatar instead",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="sm:max-w-4xl z-100">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Image Preview</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border",
                "flex items-center justify-center bg-muted/50",
                localBlur ? "blur-sm transition-all duration-500" : "transition-all duration-500"
              )}
            >
              {value ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-12 h-12" />
                  <p className="text-sm">No image selected</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Image Details</h3>
              {metadata ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-sm font-medium truncate max-w-[180px]" title={metadata.name}>
                        {metadata.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">{metadata.size}</p>
                    </div>
                  </div>
                  {metadata.dimensions && (
                    <div className="flex items-center gap-3">
                      <FileArchive className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Dimensions
                        </p>
                        <p className="text-sm font-medium">
                          {metadata.dimensions.width} ×{" "}
                          {metadata.dimensions.height} px
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Modified</p>
                      <p className="text-sm font-medium">
                        {metadata.lastModified}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No image metadata available
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  triggerFileInput();
                }}
                type="button"
              >
                Change Image
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  handleCancel();
                  setPreviewOpen(false);
                  if (onRemove) onRemove();
                }}
                type="button"
              >
                Remove Image
              </Button>
            </div>

            {/* Add Save button to the preview dialog if showSaveButton is true */}
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                setPreviewOpen(false);
                if (onSave) onSave();
              }}
              disabled={!showSaveButton}
              style={{ display: showSaveButton ? "block" : "none" }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
