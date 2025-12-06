"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Separator } from "@/core/components/ui/separator";
import { TabsContent } from "@/core/components/ui/tabs";
import { toast } from "@/core/hooks/use-toast";
import { useAuth } from "@/core/providers/auth";
import * as z from "zod";
import { getAuth } from "firebase/auth";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

// Password requirements checker (copied from signup form)
const checkPasswordRequirements = (password: string) => [
  {
    id: "length",
    text: "At least 6 characters",
    valid: password.length >= 6,
  },
  {
    id: "lowercase",
    text: "At least one lowercase letter",
    valid: /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    text: "At least one uppercase letter",
    valid: /[A-Z]/.test(password),
  },
  { id: "number", text: "At least one number", valid: /\d/.test(password) },
  {
    id: "special",
    text: "At least one special character",
    valid: /[@$!%*?&.^#]/.test(password),
  },
  {
    id: "minLength",
    text: "At least 8 characters",
    valid: password.length >= 8,
  },
];

// Zod schema for password requirements
const passwordRequirements = [
  { regex: /.{6,}/, message: "At least 6 characters" },
  { regex: /[a-z]/, message: "At least one lowercase letter" },
  { regex: /[A-Z]/, message: "At least one uppercase letter" },
  { regex: /\d/, message: "At least one number" },
  { regex: /[@$!%*?&.^#]/, message: "At least one special character" },
  { regex: /.{8,}/, message: "At least 8 characters" },
];

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .refine((val) => passwordRequirements.every((req) => req.regex.test(val)), {
        message: "Password does not meet all requirements.",
      }),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "New password and confirmation must match",
    path: ["newPasswordConfirmation"],
  });

type ProfileFormValues = z.infer<typeof changePasswordFormSchema>;

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  useEffect(() => {
    setShowPasswordReqs(!!form.getValues("newPassword"));
  }, [form.watch("newPassword")]);

  const handleChangePassword = async (data: ProfileFormValues) => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "No user email",
        description: "You must be logged in to change your password.",
      });
      return;
    }
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, data.newPassword);
      toast({
        title: "Password updated successfully!",
        description: "Your password has been changed.",
      });
      form.reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <TabsContent value="password">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className="space-y-8"
        >
          <div className="my-8">
            <h2 className="text-xl font-medium">Password</h2>
            <p className="text-sm ">please enter your current password to change your password</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:max-w-xl">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="currentPassword" className="block text-sm font-medium">
                    Current Password *
                  </FormLabel>
                  <FormControl>
                    <Input id="currentPassword" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="newPassword" className="block text-sm font-medium">
                    New Password *
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </FormControl>
                  <div
                    className={"bg-primary/10 text-primary w-full flex flex-col gap-2 rounded-sm text-xs transition-all duration-300 ease-in-out overflow-hidden" + (showPasswordReqs ? " mt-2 p-4" : "")}
                    style={{
                      maxHeight: showPasswordReqs ? 200 : 0,
                      opacity: showPasswordReqs ? 1 : 0,
                      willChange: "max-height, opacity",
                    }}
                  >
                    Make sure your password meets the following:
                    {checkPasswordRequirements(form.watch("newPassword")).map((req) => (
                      <div key={req.id} style={{ color: req.valid ? "green" : "red" }}>
                        <>{req.valid ? "✔" : "✖"} {req.text}</>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="newPasswordConfirmation" className="block text-sm font-medium">
                    Confirm Password *
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      <Input
                        id="newPasswordConfirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-10" />

          <Button type="submit">
            Update Password
          </Button>
        </form>
      </Form>
    </TabsContent>
  );
};

export default ChangePasswordForm;
