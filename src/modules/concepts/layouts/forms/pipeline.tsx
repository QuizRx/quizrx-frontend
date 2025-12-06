"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useToast } from "@/core/hooks/use-toast";
import {
  CREATE_PIPELINE_MUTATION,
  UPDATE_PIPELINE_MUTATION,
} from "@/modules/concepts/apollo/mutation/pipeline";
import { Separator } from "@/core/components/ui/separator";
import { useRouter } from "next/navigation";
import { GET_USER_PIPELINES_QUERY } from "../../apollo/query/pipeline";
import { refetchQueries } from "@/core/providers/apollo-wrapper";

// Form validation schema
const pipelineFormSchema = z.object({
  name: z.string().min(1, "Pipeline name is required"),
});

type PipelineFormValues = z.infer<typeof pipelineFormSchema>;

// Pipeline data interface
interface PipelineData {
  _id?: string;
  name: string;
}

interface PipelineDialogFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialData?: PipelineData;
  onSuccess?: () => void;
}

const PipelineDialogForm = ({
  isOpen,
  setIsOpen,
  initialData,
  onSuccess,
}: PipelineDialogFormProps) => {
  const client = useApolloClient();
  const { push } = useRouter();
  const isEditMode = !!initialData?._id;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with validation
  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(pipelineFormSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
    mode: "onChange",
  });

  // GraphQL mutations
  const [createPipeline] = useMutation(CREATE_PIPELINE_MUTATION);
  const [updatePipeline] = useMutation(UPDATE_PIPELINE_MUTATION);

  // Form submission handler
  const handleSubmit = async (values: PipelineFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && initialData?._id) {
        // Update existing pipeline
        await updatePipeline({
          variables: {
            updatePipelineId: initialData._id,
            pipelineData: {
              name: values.name,
            },
          },
          onCompleted: (data) => {
            toast({
              title: "Success",
              description: "Pipeline updated successfully",
            });
            form.reset();
            setIsOpen(false);
            refetchQueries([GET_USER_PIPELINES_QUERY]);
            if (onSuccess) onSuccess();
          },
        });
      } else {
        // Create new pipeline
        await createPipeline({
          variables: {
            pipelineData: {
              name: values.name,
            },
          },
          onCompleted: (data) => {
            toast({
              title: "Success",
              description: "Pipeline created successfully",
            });
            form.reset();
            push(`concepts/canvas/${data.createPipeline._id}`);
            setIsOpen(false);
            refetchQueries([GET_USER_PIPELINES_QUERY]);
            if (onSuccess) onSuccess();
          },
        });
      }
    } catch (error) {
      console.error("Pipeline operation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Pipeline" : "New Pipeline"}
          </DialogTitle>
        </DialogHeader>
        <Separator className="my-1" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pipeline Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="mt-10 mb-5" />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-24"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PipelineDialogForm;
