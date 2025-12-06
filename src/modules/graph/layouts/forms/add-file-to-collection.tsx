"use client";

import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useToast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useMutation, useQuery } from "@apollo/client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ADD_FILE_TO_COLLECTION_MUTATION } from "../../apollo/mutation/collection-file";
import { GET_USER_COLLECTIONS_QUERY } from "../../apollo/query/collection";
import CreateCollectionDialogForm from "./create-collection";
import { Collection } from "../../types/api/collection";
import { refetchQueries } from "@/core/providers/apollo-wrapper";
import { GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY } from "../../apollo/query/collection-file";

interface AddFileToCollectionDialogProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFileToCollectionDialog = ({
  fileId,
  isOpen,
  onClose,
  onSuccess,
}: AddFileToCollectionDialogProps) => {
  const { toast } = useToast();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  const { data: collectionsData, loading } = useQuery(
    GET_USER_COLLECTIONS_QUERY,
    {
      fetchPolicy: "network-only",
      skip: !isOpen,
    }
  );

  const [addFileToCollection, { loading: addingFile }] = useMutation(
    ADD_FILE_TO_COLLECTION_MUTATION
  );

  useEffect(() => {
    if (collectionsData?.getUserCollections?.data) {
      setCollections(collectionsData.getUserCollections.data);
    }
  }, [collectionsData]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCollectionId("");
    }
  }, [isOpen]);

  const handleAddFile = async () => {
    if (!selectedCollectionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a collection",
      });
      return;
    }

    await addFileToCollection({
      variables: {
        addFileToCollectionInput: {
          fileId,
          collectionId: selectedCollectionId,
        },
      },
      onCompleted: () => {
        refetchQueries([GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY]);
        toast({
          title: "Success",
          description: "File added to collection successfully",
        });

        onSuccess();
      },
      onError: (error) => {
        const customError = extractCustomError(error);
        customError.map((err) => {
          toast({
            variant: "destructive",
            title: err.message,
            description:
              err.details?.error || "Failed to add file to collection",
          });
        });
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add File to Collection</DialogTitle>
            <DialogDescription>
              Select a collection to add this file to
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Select
                value={selectedCollectionId}
                onValueChange={(value) => {
                  if (value === "create-new") {
                    setIsCreateDialogOpen(true);
                  } else {
                    setSelectedCollectionId(value);
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="create-new"
                    className="text-primary font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create New Collection</span>
                    </div>
                  </SelectItem>
                  {collections.length > 0 && (
                    <div className="border-t border-border my-1" />
                  )}
                  {collections.map((collection) => (
                    <SelectItem key={collection._id} value={collection._id}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="text-sm text-muted-foreground">
                Loading collections...
              </div>
            )}

            {!loading && collections.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No collections found. Create one to get started.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddFile}
              disabled={!selectedCollectionId || addingFile}
            >
              {addingFile ? "Adding..." : "Add to Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateCollectionDialogForm
        isCreateOpen={isCreateDialogOpen}
        setIsCreateOpen={setIsCreateDialogOpen}
      />
    </>
  );
};
