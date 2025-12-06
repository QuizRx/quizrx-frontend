"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { useToast } from "@/core/hooks/use-toast";
import {
  CREATE_MULTIPLE_PINECONE_CONFIGS,
  TEST_MULTIPLE_PINECONE_CONNECTIONS,
} from "@/modules/graph/apollo/mutation/pinecone";
import { LabelWithTooltip } from "@/modules/graph/components/lable-with-tooltip";
import {
  PineconeConnectionTestInput
} from "@/modules/graph/types/api/pinecone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@radix-ui/react-select";

const configSchema = z.object({
  configurations: z.array(
    z.object({
      name: z.string().min(1, "Configuration name is required"),
      pineconeApiKey: z.string().min(1, "Pinecone API Key is required"),
      pineconeEnvironment: z
        .string()
        .min(1, "Pinecone Environment is required"),
      indexName: z.string().min(1, "Index Name is required"),
      chunkSize: z.coerce.number().min(1, "Chunk Size is required"),
      chunkOverlap: z.coerce
        .number()
        .min(0, "Chunk Overlap must be 0 or greater"),
      embeddingProvider: z.string(),
      openAiApiKey: z.string().optional(),
    })
  ),
});

type FormValues = z.infer<typeof configSchema>;

const formAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const cardAnimation = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function CreatePineconeForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "config-0",
  ]);
  const [showOptionalFields, setShowOptionalFields] = useState<
    Record<number, boolean>
  >({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [connectionErrors, setConnectionErrors] = useState<
    Record<number, string>
  >({});
  const [connectionSuccess, setConnectionSuccess] = useState<
    Record<number, boolean>
  >({});
  const [allConfigsTested, setAllConfigsTested] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      configurations: [
        {
          name: "",
          pineconeApiKey: "",
          pineconeEnvironment: "",
          indexName: "",
          chunkSize: 1000,
          chunkOverlap: 200,
          embeddingProvider: "Open AI",
          openAiApiKey: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "configurations",
  });

  const [testPinecone, { loading: testLoading }] = useMutation(
    TEST_MULTIPLE_PINECONE_CONNECTIONS
  );
  const [createPinecone, { loading: createLoading }] = useMutation(
    CREATE_MULTIPLE_PINECONE_CONFIGS
  );

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const toggleOptionalFields = (index: number) => {
    setShowOptionalFields((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const prepareTestData = (data: FormValues): PineconeConnectionTestInput[] => {
    return data.configurations.map((config) => ({
      apiKey: config.pineconeApiKey,
      environmentUri: config.pineconeEnvironment,
      indexName: config.indexName,
    }));
  };

  const prepareCreateData = (data: FormValues): any[] => {
    return data.configurations.map((config) => ({
      name: config.name,
      apiKey: config.pineconeApiKey,
      environmentUri: config.pineconeEnvironment,
      indexName: config.indexName,
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      embeddingApiKey: config.openAiApiKey || undefined,
      embeddingModel: "text-embedding-ada-002",
    }));
  };

  const testConfiguration = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    setConnectionErrors({});
    setConnectionSuccess({});
    setAllConfigsTested(false);

    try {
      const testResult = await testPinecone({
        variables: {
          input: {
            configs: prepareTestData(data),
          },
        },
      });

      const testResults =
        testResult.data?.testMultiplePineconeConnections || [];
      const errorsByIndex: Record<number, string> = {};
      const successByIndex: Record<number, boolean> = {};
      let hasErrors = false;

      testResults.forEach((result, index) => {
        if (!result.success && result.errorMessage) {
          errorsByIndex[index] = result.errorMessage;
          successByIndex[index] = false;
          hasErrors = true;
        } else {
          successByIndex[index] = true;
        }
      });

      setConnectionSuccess(successByIndex);

      if (hasErrors) {
        setConnectionErrors(errorsByIndex);
        const sectionsWithErrors = Object.keys(errorsByIndex).map(
          (index) => `config-${index}`
        );
        setExpandedSections((prev) => [
          ...new Set([...prev, ...sectionsWithErrors]),
        ]);

        toast({
          title: "Connection test failed",
          description:
            "Some Pinecone connections could not be established. Please check the errors and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection test successful",
          description:
            "All Pinecone connections were established successfully.",
        });
        setAllConfigsTested(true);
      }
    } catch (error) {
      console.error("Error testing connections:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: FormValues) => {
    if (!allConfigsTested) {
      toast({
        title: "Test Required",
        description: "Please test all configurations before saving.",
        variant: "destructive",
      });
      return;
    }

    await createPinecone({
      variables: {
        input: {
          configs: prepareCreateData(data),
          validateConnections: true,
        },
      },
      onCompleted: () => {
        toast({
          title: "Configurations saved",
          description:
            "Your Pinecone configurations have been saved successfully.",
        });
        router.push("/configuration");
      },
      onError: (error) => {
        console.error("Error during create:", error);
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

  const resetTestStatus = () => {
    setAllConfigsTested(false);
    setConnectionSuccess({});
  };

  form.watch(() => resetTestStatus());

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={formAnimation}
      >
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="space-y-4"
        >
          <AnimatePresence>
            {fields.map((field, index) => {
              const configId = `config-${index}`;
              const sectionTitle =
                form.watch(`configurations.${index}.name`) ||
                `Configuration ${index + 1}`;
              const hasError = !!connectionErrors[index];
              const hasSuccess = connectionSuccess[index];

              return (
                <motion.div
                  key={field.id}
                  variants={cardAnimation}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <AccordionItem value={configId} className="border-none">
                    <Card
                      className={`rounded-lg transition-colors ${
                        hasError
                          ? "border-destructive"
                          : hasSuccess
                          ? "border-green-500"
                          : "border-border"
                      }`}
                    >
                      <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex-1 text-left flex items-center gap-2">
                          <h2 className="text-sm font-medium">
                            {sectionTitle} - {index + 1}
                          </h2>
                          {hasError && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">
                                  {connectionErrors[index]}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {hasSuccess && (
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
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 m-0 mr-2 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(index);
                              setAllConfigsTested(false);
                              setConnectionSuccess({});
                              setConnectionErrors({});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </AccordionTrigger>

                      <AccordionContent className="pt-2 pb-0 space-y-4">
                        {/* Configuration Name */}
                        <Card className="rounded-lg">
                          <div className="p-4">
                            <FormField
                              control={form.control}
                              name={`configurations.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="space-y-2 max-w-lg">
                                  <FormLabel>
                                    <LabelWithTooltip
                                      label="Configuration Name"
                                      tooltipText="The name of this Pinecone configuration"
                                    />
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter Configuration Name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>

                        {/* Indexing Section */}
                        <Card className="rounded-lg">
                          <div className="p-4 space-y-4">
                            <h3 className="text-sm font-medium">Indexing</h3>
                            <Separator />

                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`configurations.${index}.pineconeApiKey`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
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
                                            showPassword[
                                              `pineconeApiKey-${index}`
                                            ]
                                              ? "text"
                                              : "password"
                                          }
                                          placeholder="Enter Pinecone Key"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                          onClick={() =>
                                            togglePasswordVisibility(
                                              `pineconeApiKey-${index}`
                                            )
                                          }
                                        >
                                          {showPassword[
                                            `pineconeApiKey-${index}`
                                          ] ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`configurations.${index}.pineconeEnvironment`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
                                      <LabelWithTooltip
                                        label="Pinecone Environment"
                                        tooltipText="Your Pinecone environment or service URL"
                                      />
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter Pinecone Environment"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`configurations.${index}.indexName`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
                                      <LabelWithTooltip
                                        label="Index Name"
                                        tooltipText="The name of your Pinecone index"
                                      />
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter Index Name"
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
                        <Card className="rounded-lg">
                          <div className="p-4 space-y-4">
                            <h3 className="text-sm font-medium">Processing</h3>
                            <Separator />

                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`configurations.${index}.chunkSize`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
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
                                        placeholder="Enter Chunk Size"
                                        min={1}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`configurations.${index}.chunkOverlap`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
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
                                        placeholder="Enter Chunk Overlap"
                                        min={0}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="link"
                                className="text-muted-foreground text-xs p-0 h-auto flex items-center"
                                onClick={() => toggleOptionalFields(index)}
                              >
                                <ChevronRight className="h-3 w-3 mr-1 transition-transform" />
                                Optional Fields
                              </Button>
                            </div>
                          </div>
                        </Card>

                        {/* Embedding Section */}
                        <Card className="rounded-lg">
                          <div className="p-4 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <h3 className="text-sm font-medium">Embedding</h3>
                              <FormField
                                control={form.control}
                                name={`configurations.${index}.embeddingProvider`}
                                render={({ field }) => (
                                  <FormItem className="w-full md:w-auto">
                                    <Select
                                      defaultValue={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Select provider" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Open AI">
                                          Open AI
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Separator />

                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`configurations.${index}.openAiApiKey`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
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
                                            showPassword[
                                              `openAiApiKey-${index}`
                                            ]
                                              ? "text"
                                              : "password"
                                          }
                                          placeholder="API Key"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                          onClick={() =>
                                            togglePasswordVisibility(
                                              `openAiApiKey-${index}`
                                            )
                                          }
                                        >
                                          {showPassword[
                                            `openAiApiKey-${index}`
                                          ] ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                          )}
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
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Accordion>

        {/* Add Configuration Button */}
        <motion.div layout>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              const newIndex = fields.length;
              append({
                name: `Configuration ${newIndex + 1}`,
                pineconeApiKey: "",
                pineconeEnvironment: "",
                indexName: "",
                chunkSize: 1000,
                chunkOverlap: 200,
                embeddingProvider: "Open AI",
                openAiApiKey: "",
              });
              setExpandedSections((prev) => [...prev, `config-${newIndex}`]);
              setAllConfigsTested(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another pinecone configuration
          </Button>
        </motion.div>

        {/* Testing Status Banner */}
        <AnimatePresence>
          {!allConfigsTested && fields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please test your configurations before saving. All
                  configurations must be tested successfully.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-end gap-2 mt-2"
          layout
        >
          <Button
            type="button"
            variant="default"
            onClick={testConfiguration}
            disabled={testLoading}
          >
            {testLoading ? "Testing..." : "Test Pinecone"}
          </Button>
          {allConfigsTested && (
            <Button
              type="submit"
              disabled={!form.formState.isValid || createLoading}
            >
              {createLoading ? "Saving..." : "Set Configuration"}
            </Button>
          )}
        </motion.div>
      </motion.form>
    </Form>
  );
}
