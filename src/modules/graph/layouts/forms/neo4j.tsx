"use client";

import { useMutation } from "@apollo/client";
import {
  TEST_NEO4J_CONNECTION,
  UPDATE_MULTIPLE_NEO4J_CONFIGS,
} from "@/modules/graph/apollo/mutation/neo4j";
import { LabelWithTooltip } from "@/modules/graph/components/lable-with-tooltip";
import {
  Neo4jConnectionTestInput,
  UpdateNeo4jConfigInput,
} from "@/modules/graph/types/api/neo4j";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Separator } from "@/core/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { useToast } from "@/core/hooks/use-toast";
import * as z from "zod";

const configSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  uri: z.string().min(1, "Neo4j URI is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof configSchema>;

interface Neo4jConfigFormProps {
  initialData: {
    _id: string;
    name: string;
    uri: string;
    username: string;
    password: string;
  };
  isViewMode?: boolean;
  onUpdate?: () => void;
}

export default function Neo4jConfigForm({
  initialData,
  isViewMode = false,
  onUpdate,
}: Neo4jConfigFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: initialData.name || "",
      uri: initialData.uri || "",
      username: initialData.username || "",
      password: initialData.password || "",
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

  const [testNeo4j, { loading: testLoading }] = useMutation(
    TEST_NEO4J_CONNECTION
  );

  const [updateNeo4j, { loading: updateLoading }] = useMutation(
    UPDATE_MULTIPLE_NEO4J_CONFIGS
  );

  const prepareTestData = (data: FormValues): Neo4jConnectionTestInput => {
    return {
      uri: data.uri,
      username: data.username,
      password: data.password,
    };
  };

  const prepareUpdateData = (data: FormValues): UpdateNeo4jConfigInput => {
    return {
      name: data.name,
      uri: data.uri,
      username: data.username,
      password: data.password,
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

    await updateNeo4j({
      variables: {
        updateNeo4JConfigId: initialData._id,
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
              "Your Neo4j configuration has been updated successfully.",
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
      const testResult = await testNeo4j({
        variables: {
          input: prepareTestData(data),
        },
      });

      const { success, errorMessage } =
        testResult.data?.testNeo4jConnection || {};

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
              {form.watch("name") || "Neo4j Configuration"}
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
                      tooltipText="The name of this Neo4j configuration"
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

        {/* Connection Section */}
        <Card className="rounded-none">
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium">Connection</h3>
            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="uri"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Neo4j URI"
                        tooltipText="The URI for your Neo4j database connection"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-transparent"
                        placeholder="Enter URI"
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Username"
                        tooltipText="Your Neo4j database username"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-transparent"
                        placeholder="Enter Username"
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2 max-w-lg">
                    <FormLabel className="text-sm font-medium">
                      <LabelWithTooltip
                        label="Password"
                        tooltipText="Your Neo4j database password"
                      />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="bg-transparent"
                          placeholder="Enter Password"
                          disabled={isViewMode}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 lg:top-2 h-full px-3 py-2 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePasswordVisibility();
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
            {testLoading ? "Testing..." : "Test Neo4j"}
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
