"use client";

import { useMutation } from "@apollo/client";
import {
  INVITE_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/modules/graph/apollo/mutation/user";
import { UserRole, UserStatus } from "@/modules/graph/types/api/enum";
import { User } from "@/modules/graph/types/api/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/core/components/ui/button";
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
import { useToast } from "@/core/hooks/use-toast";
import { z } from "zod";

// Define the form schema with Zod
const userFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum([UserRole.VIEWER, UserRole.EDITOR, UserRole.OWNER]),
});

// Infer TypeScript type from the schema
type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  mode: "invite" | "edit" | "view";
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm = ({ user, mode, onSuccess, onCancel }: UserFormProps) => {
  const { toast } = useToast();
  const isViewMode = mode === "view";
  const isInvite = mode === "invite";
  const isEditMode = mode === "edit";

  // Set up mutations based on mode
  const [inviteUser, { loading: inviteLoading }] = useMutation(
    INVITE_USER_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "User invited successfully",
        });
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    }
  );

  const [updateUser, { loading: updateLoading }] = useMutation(
    UPDATE_USER_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    }
  );

  const defaultValues: UserFormValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: (user?.role as UserRole) || UserRole.VIEWER,
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const handleSubmit = (values: UserFormValues) => {
    if (isInvite) {
      inviteUser({
        variables: {
          inviteUserInput: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            role: values.role,
          },
        },
      });
    } else if (isEditMode && user) {
      updateUser({
        variables: {
          updateUserInput: {
            id: user._id,
            role: values.role,
          },
        },
      });
    }
  };

  const isLoading = inviteLoading || updateLoading;

  // Determine which fields are editable
  const isNameEditable = isInvite;
  const isEmailEditable = isInvite;
  const isRoleEditable = isInvite || isEditMode;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          {/* Full Name Field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter first name"
                    {...field}
                    disabled={!isNameEditable}
                  />
                </FormControl>
                {!isViewMode && <FormMessage />}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter last name"
                    {...field}
                    disabled={!isNameEditable}
                  />
                </FormControl>
                {!isViewMode && <FormMessage />}
              </FormItem>
            )}
          />
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    type="email"
                    {...field}
                    disabled={!isEmailEditable}
                  />
                </FormControl>
                {!isViewMode && <FormMessage />}
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  disabled={!isRoleEditable}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.VIEWER}>View Only</SelectItem>
                    <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                    <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
                  </SelectContent>
                </Select>
                {!isViewMode && <FormMessage />}
              </FormItem>
            )}
          />

          {/* Status Display (only if status exists) */}
          {user?.status && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span>{user.status}</span>
              {user.status === UserStatus.ACTIVE ? (
                <div className="w-2 h-2 z-50 bg-green-600 rounded-full flex flex-col items-center justify-center">
                  <div className="h-2.5 w-2.5 bg-green-700 animate-ping rounded-full" />
                </div>
              ) : (
                <div className="w-2 h-2 z-50 bg-gray-300 rounded-full" />
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {isViewMode ? "Close" : "Cancel"}
          </Button>

          {!isViewMode && (
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {isInvite ? "Add Member" : "Save Changes"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
