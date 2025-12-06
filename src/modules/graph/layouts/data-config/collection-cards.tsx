"use client";

import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { toast } from "@/core/hooks/use-toast";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderIcon, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CREATE_COLLECTION_MUTATION,
  REMOVE_COLLECTION_MUTATION,
  UPDATE_COLLECTION_MUTATION,
} from "../../apollo/mutation/collection";
import { GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY } from "../../apollo/query/collection-file";
import { Collection } from "../../types/api/collection";
import { CollectionWithFileCount } from "../../types/api/collection-file";
import CreateCollectionDialogForm from "../forms/create-collection";
import DeleteCollectionDialogForm from "../forms/delete-collection";
import EditCollectionDialogForm from "../forms/edit-collection";

const formSchema = z.object({
  title: z.string().min(1, "Collection name is required"),
});

export const CollectionCards = () => {
  const { push } = useRouter();
  const { data, error, refetch } = useQuery(
    GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY
  );
  const [updateCollection] = useMutation(UPDATE_COLLECTION_MUTATION);
  const [removeCollection] = useMutation(REMOVE_COLLECTION_MUTATION);
  const [createCollection] = useMutation(CREATE_COLLECTION_MUTATION);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [collections, setCollections] = useState<CollectionWithFileCount[]>([]);

  useEffect(() => {
    if (data?.getUserCollectionsWithFileCount?.data) {
      setCollections(data.getUserCollectionsWithFileCount.data);
    }
  }, [data]);

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleEditCollection = async (values: z.infer<typeof formSchema>) => {
    if (!editingCollection) return;

    try {
      await updateCollection({
        variables: {
          updateCollectionInput: {
            id: editingCollection._id,
            title: values.title,
          },
        },
      });
      refetch();
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating collection:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update collection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await removeCollection({
        variables: {
          removeCollectionId: id,
        },
      });
      refetch();
      setIsDeleteOpen(false);
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
    } catch (err: any) {
      console.error("Error deleting collection:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    setEditingCollection(collection);
    editForm.reset({ title: collection.title });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    setEditingCollection(collection);
    setIsDeleteOpen(true);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to load collections",
      variant: "destructive",
    });
    return <div>Error loading collections: {error.message}</div>;
  }

  return (
    <div className="space-y-6 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Collections</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <Card
            key={collection._id}
            onClick={() => {
              push(`/data-config/file-management/collection/${collection._id}`);
            }}
            className="group hover:shadow-md transition-shadow cursor-pointer bg-card border-border rounded-2xl"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col items-start space-y-5 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FolderIcon className="size-10 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary truncate text-lg">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.fileCount} Files
                    </p>
                  </div>
                </div>
                <div onClick={handleDropdownClick}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => openEditDialog(e, collection)}
                      >
                        Edit Collection
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => openDeleteDialog(e, collection)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete Collection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Collection Card */}
        <Card
          className="group hover:shadow-md transition-shadow cursor-pointer bg-card border-border border-dashed rounded-2xl"
          onClick={() => setIsCreateOpen(true)}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[120px]">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
              <Plus className="h-6 w-6 group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium group-hover:text-primary">
              Create New Folder
            </p>
          </CardContent>
        </Card>
      </div>

      <EditCollectionDialogForm
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        editForm={editForm}
        handleEditCollection={handleEditCollection}
      />

      <DeleteCollectionDialogForm
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        handleDeleteCollection={handleDeleteCollection}
        editingCollection={editingCollection}
      />

      <CreateCollectionDialogForm
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
      />
    </div>
  );
};
