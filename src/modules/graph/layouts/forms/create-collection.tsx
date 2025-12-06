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
import { toast } from "@/core/hooks/use-toast";
import { refetchQueries } from "@/core/providers/apollo-wrapper";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CREATE_COLLECTION_MUTATION } from "../../apollo/mutation/collection";
import { GET_USER_COLLECTIONS_QUERY } from "../../apollo/query/collection";
import { GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY } from "../../apollo/query/collection-file";

const formSchema = z.object({
  title: z.string().min(1, "Collection name is required"),
});

const CreateCollectionDialogForm = ({
  isCreateOpen,
  setIsCreateOpen,
}: {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}) => {
  const handleCreateCollection = async (values: z.infer<typeof formSchema>) => {
    try {
      await createCollection({
        variables: {
          createCollectionInput: {
            title: values.title,
          },
        },
      });

      refetchQueries([GET_USER_COLLECTIONS_QUERY]);
      refetchQueries([GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY]);

      createForm.reset();
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
    } catch (err: any) {
      console.error("Error creating collection:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  const [createCollection] = useMutation(CREATE_COLLECTION_MUTATION);

  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(handleCreateCollection)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
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
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionDialogForm;
