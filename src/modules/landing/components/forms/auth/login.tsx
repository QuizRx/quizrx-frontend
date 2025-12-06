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
import { auth } from "@/core/configs/firebase";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import {
  staggerUpAnimation,
  zoomInAnimation,
} from "@/core/utils/animations/motion";
import { CREATE_USER_WITH_GOOGLE_MUTATION } from "@/modules/landing/apollo/mutation/UserMutations";
import { useAuth } from "@/core/providers/auth";
import { useLazyQuery, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthErrorHandler } from "@/core/utils/firebase-error-handler";
import { useRouter } from "next/navigation";
import { GET_USER } from "@/core/providers/user";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decideNextRoute = async (idToken: string) => {
    const { data: dataUser } = await getUser({ variables: { idToken } });
    if (dataUser !== null && dataUser.user.status === "ACTIVE") {
      signIn(idToken, "/dashboard");
    } else {
      signIn(idToken, "/subscribe");
    }
  };

  const { handleAuthError } = useAuthErrorHandler();
  const { signIn } = useAuth();
  const [getUser] = useLazyQuery(GET_USER, { fetchPolicy: "network-only" });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsSubmitting(true);

    const loginOperation = async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // Get ID token instead of access token for consistency
      const idToken = await userCredential.user.getIdToken();

      // Use AuthProvider's signIn method
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

  const [createUserWithGoogle] = useMutation(CREATE_USER_WITH_GOOGLE_MUTATION);

  const provider = new GoogleAuthProvider();
  const handleGoogleLogIn = async () => {
    setIsGoogleLoading(true);

    const loginOperation = async () => {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Use AuthProvider's signIn method
      await decideNextRoute(idToken);

      toast({
        title: "Google Sign-in Successful",
        description: "You have successfully signed in with Google.",
      });

      await createUserWithGoogle({ variables: { idToken } });
    };

    try {
      await loginOperation();
    } catch (error: any) {
      await handleAuthError(error, loginOperation, (errorState) => {
        toast({
          variant: "destructive",
          title: "Google Sign-up Error",
          description: errorState.userMessage,
        });
      });
      console.error("Error during Google sign-up:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

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
            <motion.div variants={staggerUpAnimation}>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Login
              </Button>
            </motion.div>
            <motion.div
              className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
              variants={staggerUpAnimation}
            >
              <span className="relative z-10 bg-background px-2 text-muted-foreground/50">
                OR
              </span>
            </motion.div>
            <motion.div variants={staggerUpAnimation}>
              <Button
                onClick={handleGoogleLogIn}
                type="button"
                variant="outline"
                className="w-full"
                loading={isGoogleLoading}
              >
                <Image
                  src="/logo/google.svg"
                  alt="Logo"
                  width={26}
                  height={26}
                  className="size-7"
                />
                Continue with Google
              </Button>
            </motion.div>
          </motion.form>
        </Form>
        <motion.div
          className="text-center text-sm text-gray-400"
          variants={staggerUpAnimation}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="underline underline-offset-4 text-primary"
          >
            Sign up
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
