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
import { useAuth } from "@/core/providers/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthErrorHandler } from "@/core/utils/firebase-error-handler";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const decideNextRoute = async (idToken: string) => {
    // Beta: subscription gating is removed; everyone goes to /chat after login.
    signIn(idToken, "/chat");
  };

  const { handleAuthError } = useAuthErrorHandler();
  const { signIn } = useAuth();

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsSubmitting(true);

    const loginOperation = async () => {
      const userCredential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        data.email,
        data.password
      );
      const idToken = await userCredential.user.getIdToken();

      await decideNextRoute(idToken);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    };

    try {
      await loginOperation();
    } catch (error: any) {
      await handleAuthError(error, loginOperation, (errorState) => {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorState.userMessage,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <motion.div className="grid gap-2" variants={staggerUpAnimation}>
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
                          placeholder="***********"
                          required
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                        <Button
                          variant={"outline"}
                          size={"icon"}
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
            </motion.div>
            <motion.div
              className="-mt-3 text-right text-sm"
              variants={staggerUpAnimation}
            >
              <Link href="/auth/forgot-password" className="text-primary">
                Forgot password?
              </Link>
            </motion.div>
            <motion.div variants={staggerUpAnimation}>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Login
              </Button>
            </motion.div>
          </motion.form>
        </Form>
        <motion.div
          className="text-center text-sm text-muted-foreground"
          variants={staggerUpAnimation}
        >
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary">
            Sign up
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
