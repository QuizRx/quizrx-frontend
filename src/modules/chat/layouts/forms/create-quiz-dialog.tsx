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
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

const CreateQuizDialogForm = ({
  isCreateOpen,
  setIsCreateOpen,
  createForm,
  handleCreateQuiz,
  loading,
  quizType = "automated",
  selectedQuestionBanks = [],
}: {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createForm: any;
  handleCreateQuiz: (values: any) => void;
  loading: boolean;
  quizType?: "automated" | "selected" | "mock";
  selectedQuestionBanks?: any[];
}) => {
  const getQuizTypeInfo = () => {
    if (quizType === "selected") {
      return {
        title: "Create Selected Quiz",
        description:
          "Generate a quiz from your selected topics to test your knowledge on specific areas.",
      };
    }
    if (quizType === "mock") {
      return {
        title: "Create Mock Exam",
        description:
          "Simulate a full-length mock exam from this subject to test your knowledge.",
      };
    }

    return {
      title: "Create Automated Quiz",
      description:
        "Instantly generate an automated quiz from all topics to test your overall understanding.",
    };
  };

  const { title, description } = getQuizTypeInfo();

  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-3">
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(handleCreateQuiz)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Quiz Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                loading={loading}
                disabled={loading}
                type="submit"
                className="w-full"
              >
                Generate Quiz
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialogForm;
