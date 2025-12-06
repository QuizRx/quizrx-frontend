"use client";

import {
  signUpFormSchema,
  SignUpFormValues,
} from "@/modules/landing/schema/sign-up";
import { useSubscriptionStore } from "@/modules/landing/store/subscription";
import { useMutation, useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { setCookie } from "cookies-next";
import {
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION,
  CREATE_USER_WITH_GOOGLE_MUTATION,
} from "@/modules/landing/apollo/mutation/UserMutations";
import { GET_USER } from "@/core/providers/user";
export function SignupForm({
  forceEmail,
  startingName,
}: {
  forceEmail?: string;
  startingName?: string;
}) {
  const [getUser] = useLazyQuery(GET_USER, { fetchPolicy: "network-only" });
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: startingName ? startingName.split(" ")[0] : "",
      lastName: startingName ? startingName.split(" ").slice(1).join(" ") : "",
      email: forceEmail || "",
      password: "",
    },
  });
  const [createUserWithEmailAndPasswordMutation, { loading }] = useMutation(
    CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION
  );
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { subscriptionId, setStatus, setEmail } = useSubscriptionStore();

  const decideNextRoute = async () => {
    const { data: dataUser } = await getUser();

    if (dataUser !== null && dataUser.user.status === "ACTIVE") {
      router.push("/dashboard");
    } else {
      router.push("/subscribe");
    }
  };

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    await createUserWithEmailAndPasswordMutation({
      variables: {
        createUserInput: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        },
      },
      onCompleted: async (res) => {
        if (res.createUserWithEmailAndPassword) {
          toast({
            title: "Success",
            description: "Account created successfully!",
          });
          const customToken = res.createUserWithEmailAndPassword;
          signInWithCustomToken(auth, customToken)
            .then((cred) => cred.user.getIdToken())
            .then(async (idToken) => {
              setCookie("token", idToken);
              setEmail(data.email);
              setStatus("processing");
              await decideNextRoute();
            })
            .catch((error) => {
              console.error("Sign-in error:", error);
              toast({
                variant: "destructive",
                title: "Sign-in Error",
                description: "Please sign in manually.",
              });
              !subscriptionId && router.push("/auth/login");
            });
        }
      },
      onError: (error) => {
        console.error("Error creating user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const [createUserWithGoogle] = useMutation(CREATE_USER_WITH_GOOGLE_MUTATION);

  const handleGoogleSignUp = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        toast({
          title: "Google Sign-in Successful",
          description: "You have successfully signed in with Google.",
        });
        const id = await result.user.getIdToken();
        setEmail(result.user.email!);
        return id;
      })
      .then(async (idToken) => {
        setCookie("token", idToken);
        setStatus("processing");
        await createUserWithGoogle({ variables: { idToken } });
        await decideNextRoute();
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Google Sign-up Error",
          description: error.message,
        });
      });
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("flex flex-col gap-6")}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex gap-3">
            {(["firstName", "lastName"] as const).map((fieldName) => (
              <motion.div
                key={fieldName}
                className="grid gap-2 z-10 flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <FormField
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          {...field}
                          id={fieldName}
                          placeholder={`Enter your ${
                            fieldName === "firstName"
                              ? "First Name"
                              : "Last Name"
                          }`}
                          required
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            ))}
          </div>
          <motion.div
            className="grid gap-2 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
                      placeholder="Enter your Email"
                      required
                      value={field.value || ""}
                      disabled={!!forceEmail}
                      readOnly={!!forceEmail}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
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
                        onChange={(e) => field.onChange(e)}
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

            {form.getValues("password") && (
              <motion.pre
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-primary/10 text-primary w-full flex flex-col gap-2 rounded-sm p-4 text-xs"
              >
                Make sure your password meets the following:
                {checkPasswordRequirements(form.watch("password")).map(
                  (req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: req.valid ? "green" : "red" }}
                    >
                      {req.valid ? "✔" : "✖"} {req.text}
                    </motion.div>
                  )
                )}
              </motion.pre>
            )}
          </motion.div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            loading={loading}
          >
            Sign Up
          </Button>

          <motion.div
            className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className="relative z-10 bg-background px-2 text-muted-foreground/50">
              OR
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleGoogleSignUp}
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
        </form>
      </Form>

      <motion.div
        className="text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary">
          Login
        </Link>
      </motion.div>
    </motion.div>
  );
}
