export interface ImageMetadata {
  name: string;
  size: string;
  type: string;
  lastModified: string;
  dimensions?: { width: number; height: number };
}

export interface FileUploadProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export interface ImagePreviewDialogProps {
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  value?: string;
  metadata: ImageMetadata | null;
  triggerFileInput: () => void;
  handleCancel: () => void;
  showSaveButton?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
}
