"use client";

import { TableTitleHeader } from "@/core/components/table";
import { DataTable } from "@/core/components/table/data-table";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Checkbox } from "@/core/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Progress } from "@/core/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Separator } from "@/core/components/ui/separator";
import { useToast } from "@/core/hooks/use-toast";
import { enumToText } from "@/core/utils/enum-to-text";
import extractCustomError from "@/core/utils/extract-custom-error";
import { formatFileSize } from "@/core/utils/format-file-size";
import { useMutation, useQuery } from "@apollo/client";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { EMBED_FILE_MUTATION } from "../../apollo/mutation/embedding";
import { GET_USER_FILE_EMBEDDINGS_QUERY } from "../../apollo/query/embedding";
import { GET_USER_PINECONE_CONFIGS } from "../../apollo/query/pinecone";
import { fileEmbeddingColumns } from "../../components/columns/file-embedding";
import { EmbeddingStatus, FileWithEmbedding } from "../../types/api/embedding";
import { PineconeConfig } from "../../types/api/pinecone";

export const FileEmbeddingTable = () => {
  const { toast } = useToast();
  const [filesData, setFilesData] = useState<FileWithEmbedding[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedPineconeId, setSelectedPineconeId] = useState<string>("");
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [embedProgress, setEmbedProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completeProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, loading, error, refetch } = useQuery(
    GET_USER_FILE_EMBEDDINGS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (data?.getUserFileEmbeddings?.data) {
      setFilesData(data.getUserFileEmbeddings.data);
    }
    if (error) {
      const customError = extractCustomError(error);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [data, error, toast]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (completeProgressTimeoutRef.current) {
        clearTimeout(completeProgressTimeoutRef.current);
      }
    };
  }, []);

  // Handler for checkbox selection
  const handleRowSelect = (fileId: string) => {
    setSelectedFileId((prevSelected) =>
      prevSelected === fileId ? null : fileId
    );
  };

  // Get the selected file for use within this component
  const selectedFile = selectedFileId
    ? filesData.find((file) => file._id === selectedFileId)
    : null;

  const [pineconeData, setPineconeData] = useState<PineconeConfig[]>([]);
  // Pinecone data query
  const {
    data: pineconeQueryData,
    loading: pineconeLoading,
    error: pineconeError,
  } = useQuery(GET_USER_PINECONE_CONFIGS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (pineconeQueryData?.getUserPineconeConfigs?.data) {
      setPineconeData(pineconeQueryData.getUserPineconeConfigs.data);
      // Set default selected pinecone config if available
      if (
        pineconeQueryData.getUserPineconeConfigs.data.length > 0 &&
        !selectedPineconeId
      ) {
        setSelectedPineconeId(
          pineconeQueryData.getUserPineconeConfigs.data[0]._id
        );
      }
    }
    if (pineconeError) {
      const customError = extractCustomError(pineconeError);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [pineconeQueryData, pineconeError, toast, selectedPineconeId]);

  // Function to complete the progress to 100% and close the dialog
  const completeProgress = () => {
    // Quickly increment from current progress to 100%
    let currentProgress = embedProgress;
    const fastInterval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 100) {
        clearInterval(fastInterval);
        setEmbedProgress(100);

        // Close the dialog after a brief delay to show 100%
        setTimeout(() => {
          setIsEmbedding(false);
          toast({
            title: "File Embedded",
            description: "Your file is embedded successfully",
          });
        }, 500);
      } else {
        setEmbedProgress(currentProgress);
      }
    }, 50);
  };

  // Embed file mutation
  const [embedFile, { loading: embedLoading }] = useMutation(
    EMBED_FILE_MUTATION,
    {
      onCompleted: (data) => {
        // Instead of closing immediately, complete the progress animation first
        completeProgress();
        refetch(); // Refresh the files list after embedding
      },
      onError: (error) => {
        // Clear any existing intervals
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        const customError = extractCustomError(error);
        customError.map((error) => {
          toast({
            variant: "destructive",
            title: error.message,
            description: error.details.error,
          });
        });
        setIsEmbedding(false);
      },
    }
  );

  // Function to handle embedding
  const handleEmbedData = () => {
    if (!selectedFileId) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to embed",
      });
      return;
    }

    if (!selectedPineconeId) {
      toast({
        variant: "destructive",
        title: "No Pinecone config selected",
        description: "Please select a Pinecone configuration",
      });
      return;
    }

    setIsEmbedding(true);
    setEmbedProgress(0);

    // Define the point where progress should get stuck (e.g., 70%)
    const stuckPoint = 70;

    // Clear any existing intervals/timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Create a realistic progress simulation that slows down as it approaches the stuck point
    progressIntervalRef.current = setInterval(() => {
      setEmbedProgress((prev) => {
        // If we're close to the stuck point, progress much more slowly
        if (prev >= stuckPoint - 5) {
          // Makes progress very slow near the stuck point
          const increment = Math.max(0.2, (stuckPoint - prev) / 10);
          return Math.min(prev + increment, stuckPoint);
        }
        // Otherwise progress at normal speed but slow down as we approach the stuck point
        else {
          const distanceToStuck = stuckPoint - prev;
          const slowdownFactor = Math.min(1, distanceToStuck / 30);
          return prev + 5 * slowdownFactor;
        }
      });
    }, 300);

    // Call the mutation
    embedFile({
      variables: {
        embedFileInput: {
          fileId: selectedFileId,
          pineconeConfigId: selectedPineconeId,
        },
      },
    })
      .then(() => {
        // onCompleted will handle the success case
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      })
      .catch(() => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      });
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Main content with table and side card */}
      <div className="flex gap-6">
        <div className="flex-1">
          <DataTable
            header={
              <TableTitleHeader
                title="Attached Files"
                description="Upload Files and Assets."
                onSearchTextChange={() => {}}
                onFilterChange={() => {}}
              />
            }
            columns={fileEmbeddingColumns(selectedFileId, handleRowSelect)}
            data={filesData}
            isLoading={loading}
          />
        </div>

        {/* Data Details Panel */}
        <Card className="w-80 border-text-muted-foreground">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl mb-1">Data Details</CardTitle>
            <CardDescription className="text-sm">
              Meta data of selected file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-6" />

            {selectedFile ? (
              <div className="space-y-6 text-sm font-normal">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">Document</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="ml-2">
                    {selectedFile.filename.length > 25
                      ? `${selectedFile.filename.substring(0, 25)}...`
                      : selectedFile.filename}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">File Type</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="ml-2">{selectedFile.mimetype}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">File Size</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="ml-2">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">
                    Uploaded Date
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="ml-2">
                    {moment(selectedFile.createdAt).format("M/d/yy")}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">Status</span>
                  <span className="text-muted-foreground">-</span>
                  <span
                    className={`mx-2 ${
                      selectedFile.embeddingStatus === EmbeddingStatus.EMBEDDED
                        ? "text-purple-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {enumToText(selectedFile.embeddingStatus)}
                  </span>
                  {selectedFile.embeddingStatus === EmbeddingStatus.EMBEDDED ? (
                    <Checkbox checked={true} aria-label="Embedded" />
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-12">
                No file selected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Embed Controls Below Both Table and Card */}
      {selectedFile &&
        selectedFile.embeddingStatus !== EmbeddingStatus.EMBEDDED && (
          <div>
            <Separator className="mb-6" />
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Pinecone Config:</span>
                <Select
                  value={selectedPineconeId}
                  onValueChange={setSelectedPineconeId}
                  disabled={
                    embedLoading || pineconeLoading || !pineconeData.length
                  }
                >
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select Pinecone config" />
                  </SelectTrigger>
                  <SelectContent>
                    {pineconeData.map((config) => (
                      <SelectItem key={config._id} value={config._id}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleEmbedData}
                disabled={
                  embedLoading || !selectedFileId || !selectedPineconeId
                }
              >
                Embed Data
              </Button>
            </div>
          </div>
        )}

      {/* Embedding Progress Dialog */}
      <Dialog
        open={isEmbedding}
        onOpenChange={(open) => {
          // Only allow manual close if not actively embedding
          if (!embedLoading) {
            setIsEmbedding(open);
            // Clean up any intervals if dialog is closed manually
            if (!open && progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-muted-foreground">
          <DialogTitle className="text-center mb-4">
            Embedding Data...
          </DialogTitle>
          <Progress value={embedProgress} className="mb-2" />
          <div className="text-center text-sm">
            {Math.round(embedProgress)}%
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
