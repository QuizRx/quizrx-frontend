"use client";

import { Collection } from "@/modules/graph/types/api/collection";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";

const DeleteCollectionDialogForm = ({
  isDeleteOpen,
  setIsDeleteOpen,
  handleDeleteCollection,
  editingCollection,
}: {
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
  handleDeleteCollection: (id: string) => void;
  editingCollection: Collection | null;
}) => {
  return (
    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Delete Collection</DialogTitle>
        </DialogHeader>
        <p className="py-4">Are you sure you want to delete this collection?</p>
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsDeleteOpen(false)}
            className="w-24"
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              editingCollection && handleDeleteCollection(editingCollection._id)
            }
            variant={"destructive"}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCollectionDialogForm;
