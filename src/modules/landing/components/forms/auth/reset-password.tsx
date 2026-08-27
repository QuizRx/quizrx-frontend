"use client";

import { Button } from "@/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { getFirebaseAuth } from "@/core/configs/firebase";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { useAuthErrorHandler } from "@/core/utils/firebase-error-handler";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/modules/landing/schema/reset-password";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type VerifyStatus = "verifying" | "ready" | "invalid" | "done";

const checkPasswordRequirements = (password: string) => [
  { id: "length", text: "At least 6 characters", valid: password.length >= 6 },
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
  { id: "minLength", text: "At least 8 characters", valid: password.length >= 8 },
];

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [email, setEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { handleAuthError } = useAuthErrorHandler();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!oobCode || (mode && mode !== "resetPassword")) {
      setStatus("invalid");
      return;
    }

    let active = true;
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then((verifiedEmail) => {
        if (!active) return;
        setEmail(verifiedEmail);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("invalid");
      });

    return () => {
      active = false;
    };
  }, [oobCode, mode]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    if (!oobCode) return;
    setIsSubmitting(true);

    const resetOperation = async () => {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, data.password);
      setStatus("done");
      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });
    };

    try {
      await resetOperation();
    } catch (error: any) {
      await handleAuthError(error, resetOperation, (errorState) => {
        toast({
          variant: "destructive",
          title: "Couldn't reset password",
          description: errorState.userMessage,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Verifying your reset link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 p-4 text-center"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <XCircle className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">This link is invalid</h2>
          <p className="text-sm text-muted-foreground">
            Your reset link is invalid or has expired. Request a new one and try
            again.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request a new link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 p-4 text-center"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Password updated</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been changed. You can now log in with your new
            password.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-6 p-4")}
    >
      {email && (
        <p className="text-center text-sm text-muted-foreground">
          Resetting the password for{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-2 z-10">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex gap-1">
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        required
                        value={field.value || ""}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("password") && (
              <motion.pre
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-primary/10 text-primary w-full flex flex-col gap-2 rounded-sm p-4 text-xs"
              >
                Make sure your password meets the following:
                {checkPasswordRequirements(form.watch("password")).map(
                  (req) => (
                    <div
                      key={req.id}
                      style={{ color: req.valid ? "green" : "red" }}
                    >
                      {req.valid ? "✔" : "✖"} {req.text}
                    </div>
                  )
                )}
              </motion.pre>
            )}
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      required
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary">
          Back to login
        </Link>
      </div>
    </motion.div>
  );
}
