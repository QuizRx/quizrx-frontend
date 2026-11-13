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
import {
  staggerUpAnimation,
  zoomInAnimation,
} from "@/core/utils/animations/motion";
import { useAuthErrorHandler } from "@/core/utils/firebase-error-handler";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail, type ActionCodeSettings } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { handleAuthError } = useAuthErrorHandler();

  const onSubmit: SubmitHandler<ForgotPasswordValues> = async (data) => {
    setIsSubmitting(true);

    const resetOperation = async () => {
      // After a successful reset, send the user back to login. Firebase
      // requires the continueUrl's host to be in the project's authorized
      // domains, so we derive it from the current origin at runtime.
      const actionCodeSettings: ActionCodeSettings | undefined =
        typeof window !== "undefined"
          ? { url: `${window.location.origin}/auth/login`, handleCodeInApp: false }
          : undefined;

      await sendPasswordResetEmail(
        getFirebaseAuth(),
        data.email,
        actionCodeSettings
      );
      setSentTo(data.email);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    };

    try {
      await resetOperation();
    } catch (error: any) {
      await handleAuthError(error, resetOperation, (errorState) => {
        toast({
          variant: "destructive",
          title: "Couldn't send reset link",
          description: errorState.userMessage,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={zoomInAnimation}
        className={cn("flex flex-col items-center gap-6 p-4 text-center")}
      >
        <motion.span
          variants={staggerUpAnimation}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <MailCheck className="h-6 w-6" />
        </motion.span>
        <motion.div variants={staggerUpAnimation} className="space-y-2">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>,
            we&apos;ve sent a link to reset your password. The link expires
            shortly, so use it soon.
          </p>
        </motion.div>
        <motion.div
          variants={staggerUpAnimation}
          className="flex w-full flex-col gap-3"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSentTo(null);
              form.reset();
            }}
          >
            Use a different email
          </Button>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={zoomInAnimation}
        className={cn("flex flex-col gap-6 p-4")}
      >
        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
            variants={zoomInAnimation}
          >
            <motion.div
              className="grid gap-2 z-10"
              variants={staggerUpAnimation}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter Your Email"
                        required
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={staggerUpAnimation}>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Send reset link
              </Button>
            </motion.div>
          </motion.form>
        </Form>
        <motion.div
          className="text-center text-sm text-muted-foreground"
          variants={staggerUpAnimation}
        >
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary">
            Back to login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
