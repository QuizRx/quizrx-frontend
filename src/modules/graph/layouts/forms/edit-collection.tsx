"use client";

import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
const EditCollectionDialogForm = ({
  isEditOpen,
  setIsEditOpen,
  editForm,
  handleEditCollection,
}: {
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  editForm: any;
  handleEditCollection: (values: any) => void;
}) => {
  return (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(handleEditCollection)}
            className="space-y-4"
          >
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Collection Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" className="w-24">
                Update
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCollectionDialogForm;
