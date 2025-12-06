"use client";

import { useMutation } from "@apollo/client";
import {
  TEST_PINECONE_CONNECTION,
  UPDATE_PINECONE_CONFIG,
} from "@/modules/graph/apollo/mutation/pinecone";
import { LabelWithTooltip } from "@/modules/graph/components/lable-with-tooltip";
import {
  PineconeConnectionTestInput,
  UpdatePineconeConfigInput,
} from "@/modules/graph/types/api/pinecone";
import { AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Separator } from "@/core/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { useToast } from "@/core/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const configSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  pineconeApiKey: z.string().min(1, "Pinecone API Key is required"),
  pineconeEnvironment: z.string().min(1, "Pinecone Environment is required"),
  indexName: z.string().min(1, "Index Name is required"),
  chunkSize: z.coerce.number().min(1, "Chunk Size is required"),
  chunkOverlap: z.coerce.number().min(0, "Chunk Overlap must be 0 or greater"),
  embeddingProvider: z.string(), // Remove the default here
  openAiApiKey: z.string().optional(),
});

type FormValues = z.infer<typeof configSchema>;

interface PineconeConfigFormProps {
  initialData: {
    _id: string;
    name: string;
    apiKey: string;
    environmentUri: string;
    indexName: string;
    chunkSize: number;
    chunkOverlap: number;
    embeddingModel?: string;
    embeddingApiKey?: string;
  };
  isViewMode?: boolean;
  onUpdate?: () => void;
}

export default function PineconeConfigForm({
  initialData,
  isViewMode = false,
  onUpdate,
}: PineconeConfigFormProps) {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: initialData.name || "",
      pineconeApiKey: initialData.apiKey || "",
      pineconeEnvironment: initialData.environmentUri || "",
      indexName: initialData.indexName || "",
      chunkSize: initialData.chunkSize || 1000,
      chunkOverlap: initialData.chunkOverlap || 200,
      embeddingProvider: "Open AI",
      openAiApiKey: initialData.embeddingApiKey || "",
    },
    mode: "onChange",
  });

  // When in view mode, set all fields to disabled
  useEffect(() => {
    if (isViewMode) {
      Object.keys(form.getValues()).forEach((fieldName) => {
        form.register(fieldName as any);
      });
    }
  }, [isViewMode, form]);

  const [testPinecone, { loading: testLoading }] = useMutation(
    TEST_PINECONE_CONNECTION
  );

  const [updatePinecone, { loading: updateLoading }] = useMutation(
    UPDATE_PINECONE_CONFIG
  );

  const prepareTestData = (data: FormValues): PineconeConnectionTestInput => {
    return {
      apiKey: data.pineconeApiKey,
      environmentUri: data.pineconeEnvironment,
      indexName: data.indexName,
    };
  };

  const prepareUpdateData = (data: FormValues): UpdatePineconeConfigInput => {
    return {
      name: data.name,
      apiKey: data.pineconeApiKey,
      environmentUri: data.pineconeEnvironment,
      indexName: data.indexName,
      chunkSize: data.chunkSize,
      chunkOverlap: data.chunkOverlap,
      embeddingModel:
        data.embeddingProvider === "Open AI"
          ? "text-embedding-ada-002"
          : undefined,
      embeddingApiKey: data.openAiApiKey,
    };
  };

  const handleSubmit = async (data: FormValues) => {
    if (!connectionSuccess) {
      toast({
        title: "Test Required",
        description: "Please test the configuration before saving.",
        variant: "destructive",
      });
      return;
    }

    await updatePinecone({
      variables: {
        updatePineconeConfigId: initialData._id,
        configData: prepareUpdateData(data),
        validateConnections: false,
      },
      onCompleted: () => {
        if (onUpdate) {
          onUpdate();
        } else {
          toast({
            title: "Configuration updated",
            description:
              "Your Pinecone configuration has been updated successfully.",
          });
        }
      },
      onError: (error) => {
        console.error("Error during update:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });
      },
    });
  };

  const testConfiguration = async () => {
    // Trigger form validation
    const isValid = await form.trigger();

    // Only proceed with testing if validation passed
    if (!isValid) {
      return;
    }

    const data = form.getValues();
    setConnectionError(null);
    setConnectionSuccess(false);

    try {
      const testResult = await testPinecone({
        variables: {
          input: prepareTestData(data),
        },
      });

      const { success, errorMessage } =
        testResult.data?.testPineconeConnection || {};

      if (!success && errorMessage) {
        setConnectionError(errorMessage);
      } else {
        setConnectionSuccess(true);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setConnectionError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Reset test status when form values change
  const resetTestStatus = () => {
    setConnectionSuccess(false);
    setConnectionError(null);
  };

  // Watch for form changes to reset test status
  form.watch(() => resetTestStatus());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Configuration Header */}
        <Card
          className={`p-4 ${
            connectionError
              ? "border-red-500"
              : connectionSuccess
              ? "border-green-500"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">
              {form.watch("name") || "Pinecone Configuration"}
            </h2>
            {connectionError && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{connectionError}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {connectionSuccess && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Connection tested successfully
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Card>

        {/* Configuration Name */}
        <Card className="rounded-none">
          <div className="p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2 max-w-lg">
                  <FormLabel className="text-sm font-medium">
                    <LabelWithTooltip
                      label="Configuration Name"
                      tooltipText="The name of this Pinecone configuration"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-transparent"
                      placeholder="Enter Configuration Name"
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Indexing Section */}
        <Card className="rounded-none">
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium">Indexing</h3>
            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="pineconeApiKey"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Pinecone API Key"
                        tooltipText="Your Pinecone API key from the Pinecone console"
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={
                            showPassword["pineconeApiKey"] ? "text" : "password"
                          }
                          className="bg-transparent"
                          placeholder="Enter Pinecone Key"
                          disabled={isViewMode}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 lg:top-2 h-full px-3 py-2 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePasswordVisibility("pineconeApiKey");
                          }}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pineconeEnvironment"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Pinecone Environment"
                        tooltipText="Your Pinecone environment or service URL"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-transparent"
                        placeholder="Enter Pinecone Environment"
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="indexName"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Index Name"
                        tooltipText="The name of your Pinecone index"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-transparent"
                        placeholder="Enter Index Name"
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Processing Section */}
        <Card className="rounded-none">
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium">Processing</h3>
            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="chunkSize"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Chunk Size"
                        tooltipText="Size of text chunks for processing"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                        className="bg-transparent"
                        placeholder="Enter Chunk Size"
                        min={1}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chunkOverlap"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Chunk Overlap"
                        tooltipText="Number of characters to overlap between chunks"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value, 10);
                          field.onChange(value);
                        }}
                        className="bg-transparent"
                        placeholder="Enter Chunk Overlap"
                        min={0}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Embedding Section */}
        <Card className="rounded-none">
          <div className="p-4 space-y-4">
            <div className="flex max-lg:gap-10 items-center justify-between">
              <h3 className="text-sm font-medium">Embedding</h3>
              <Separator className="max-lg:hidden lg:flex-1 lg:mx-5" />
              <FormField
                control={form.control}
                name="embeddingProvider"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open AI">Open AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <Separator className="lg:hidden" />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="openAiApiKey"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Open AI API Key"
                        tooltipText="Your OpenAI API key for embedding generation"
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={
                            showPassword["openAiApiKey"] ? "text" : "password"
                          }
                          className="bg-transparent"
                          placeholder="API Key"
                          disabled={isViewMode}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 lg:top-2 h-full px-3 py-2 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePasswordVisibility("openAiApiKey");
                          }}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-8">
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 text-gray-300"
            onClick={testConfiguration}
            disabled={testLoading}
          >
            {testLoading ? "Testing..." : "Test Pinecone"}
          </Button>
          {!isViewMode && connectionSuccess && (
            <Button
              type="submit"
              disabled={!form.formState.isValid || updateLoading}
            >
              {updateLoading ? "Saving..." : "Update Configuration"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
