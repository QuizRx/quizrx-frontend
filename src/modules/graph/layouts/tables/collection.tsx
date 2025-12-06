"use client";

import { DataTable } from "@/core/components/table/data-table";
import { toast } from "@/core/hooks/use-toast";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  REMOVE_COLLECTION_MUTATION,
  UPDATE_COLLECTION_MUTATION,
} from "../../apollo/mutation/collection";
import { GET_USER_COLLECTIONS_QUERY } from "../../apollo/query/collection";
import { collectionChunksColumns } from "../../components/columns/collection-columns";
import CustomCollectionTableHeader from "../../components/header/collection";
import { Collection } from "../../types/api/collection";
import DeleteCollectionDialogForm from "../forms/delete-collection";
import EditCollectionDialogForm from "../forms/edit-collection";

const formSchema = z.object({
  title: z.string().min(1, "Collection name is required"),
});

export const CollectionTable = () => {
  const { data, error, refetch } = useQuery(GET_USER_COLLECTIONS_QUERY);
  const [updateCollection] = useMutation(UPDATE_COLLECTION_MUTATION);
  const [removeCollection] = useMutation(REMOVE_COLLECTION_MUTATION);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (data?.getUserCollections?.data) {
      setCollections(data.getUserCollections.data);
    }
  }, [data]);

  const editForm = useForm<z.infer<typeof formSchema>>({
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
  const openEditDialog = (collection: Collection) => {
    setEditingCollection(collection);
    editForm.reset({ title: collection.title });
    setIsEditOpen(true);
  };
  const openDeleteDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setIsDeleteOpen(true);
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
    <>
      <div className="mt-8 space-y-8">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No collections found.</p>
          </div>
        ) : (
          collections.map((collection) => (
            <div key={collection._id} className="border-b pb-8 last:border-b-0">
              <DataTable
                columns={collectionChunksColumns}
                data={[]}
                header={
                  <CustomCollectionTableHeader
                    title={collection.title}
                    collection={collection}
                    openEditDialog={openEditDialog}
                    openDeleteDialog={openDeleteDialog}
                  />
                }
              />
            </div>
          ))
        )}
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
    </>
  );
};
