"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { useToast } from "@/core/hooks/use-toast";
import {
  CREATE_MULTIPLE_NEO4J_CONFIGS,
  TEST_MULTIPLE_NEO4J_CONNECTIONS,
} from "@/modules/graph/apollo/mutation/neo4j";
import { LabelWithTooltip } from "@/modules/graph/components/lable-with-tooltip";
import {
  CreateNeo4jConfigInput,
  Neo4jConnectionTestInput,
} from "@/modules/graph/types/api/neo4j";

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
import { Separator } from "@/core/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

const configSchema = z.object({
  configurations: z.array(
    z.object({
      name: z.string().min(1, "Configuration name is required"),
      neo4jUri: z.string().min(1, "Neo4j URI is required"),
      userName: z.string().min(1, "User Name is required"),
      password: z.string().min(1, "Password is required"),
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

export default function CreateNeo4jForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "config-0",
  ]);
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
          neo4jUri: "",
          userName: "",
          password: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "configurations",
  });

  const [testNeo4j, { loading: testLoading }] = useMutation(
    TEST_MULTIPLE_NEO4J_CONNECTIONS
  );
  const [createNeo4j, { loading: createLoading }] = useMutation(
    CREATE_MULTIPLE_NEO4J_CONFIGS
  );

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const prepareTestData = (data: FormValues): Neo4jConnectionTestInput[] => {
    return data.configurations.map((config) => ({
      uri: config.neo4jUri,
      username: config.userName,
      password: config.password,
    }));
  };

  const prepareCreateData = (data: FormValues): CreateNeo4jConfigInput[] => {
    return data.configurations.map((config) => ({
      name: config.name,
      uri: config.neo4jUri,
      username: config.userName,
      password: config.password,
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
      const testResult = await testNeo4j({
        variables: {
          input: {
            configs: prepareTestData(data),
          },
        },
      });

      const testResults = testResult.data?.testMultipleNeo4jConnections || [];
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
            "Some Neo4j connections could not be established. Please check the errors and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection test successful",
          description: "All Neo4j connections were established successfully.",
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

    await createNeo4j({
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
            "Your Neo4j configurations have been saved successfully.",
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
        className="space-y-4 flex flex-col h-full"
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
                                      tooltipText="The name of this Neo4j configuration"
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

                        {/* Connection Section */}
                        <Card className="rounded-lg">
                          <div className="p-4 space-y-4">
                            <h3 className="text-sm font-medium">Connection</h3>
                            <Separator />

                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`configurations.${index}.neo4jUri`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
                                      <LabelWithTooltip
                                        label="Neo4j URI"
                                        tooltipText="The URI for your Neo4j database connection"
                                      />
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter URI (e.g., neo4j+s://example.com)"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`configurations.${index}.userName`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
                                      <LabelWithTooltip
                                        label="User Name"
                                        tooltipText="Your Neo4j database username"
                                      />
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter User Name"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`configurations.${index}.password`}
                                render={({ field }) => (
                                  <FormItem className="space-y-2 max-w-lg">
                                    <FormLabel>
                                      <LabelWithTooltip
                                        label="Password"
                                        tooltipText="Your Neo4j database password"
                                      />
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          {...field}
                                          type={
                                            showPassword[`password-${index}`]
                                              ? "text"
                                              : "password"
                                          }
                                          placeholder="Enter Password"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                          onClick={() =>
                                            togglePasswordVisibility(
                                              `password-${index}`
                                            )
                                          }
                                        >
                                          {showPassword[`password-${index}`] ? (
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
                neo4jUri: "",
                userName: "",
                password: "",
              });
              setExpandedSections((prev) => [...prev, `config-${newIndex}`]);
              setAllConfigsTested(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another Neo4j configuration
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
            {testLoading ? "Testing..." : "Test Neo4j"}
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
