"use client";

import {
  signUpFormSchema,
  SignUpFormValues,
} from "@/modules/landing/schema/sign-up";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/core/components/ui/checkbox";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { getFirebaseAuth } from "@/core/configs/firebase";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { useAuth } from "@/core/providers/auth";
import { EXAM_PREPARATION_OPTIONS } from "@/modules/landing/data/exam-options";
import { signInWithCustomToken } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION } from "@/modules/landing/apollo/mutation/UserMutations";

export function SignupForm({
  forceEmail,
  startingName,
}: {
  forceEmail?: string;
  startingName?: string;
}) {
  const { signIn } = useAuth();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: startingName ? startingName.split(" ")[0] : "",
      lastName: startingName ? startingName.split(" ").slice(1).join(" ") : "",
      email: forceEmail || "",
      password: "",
      whatsappNumber: "",
      whatsappConsent: false,
      examPreparation: undefined,
    },
  });
  const [createUserWithEmailAndPasswordMutation, { loading }] = useMutation(
    CREATE_USER_WITH_EMAIL_AND_PASSWORD_MUTATION
  );
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    const whatsappNumber = data.whatsappNumber?.trim();

    await createUserWithEmailAndPasswordMutation({
      variables: {
        createUserInput: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          ...(whatsappNumber ? { whatsappNumber } : {}),
          whatsappConsent: data.whatsappConsent ?? false,
          ...(data.examPreparation
            ? { examPreparation: data.examPreparation }
            : {}),
        },
      },
      onCompleted: async (res) => {
        if (res.createUserWithEmailAndPassword) {
          toast({
            title: "Success",
            description: "Account created successfully!",
          });
          try {
            const cred = await signInWithCustomToken(
              getFirebaseAuth(),
              res.createUserWithEmailAndPassword
            );
            const idToken = await cred.user.getIdToken();
            await signIn(idToken, "/chat");
          } catch (error) {
            console.error("Sign-in error:", error);
            toast({
              variant: "destructive",
              title: "Sign-in Error",
              description: "Account created — please sign in manually.",
            });
          }
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
      transition={{ duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] as const }}
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
                transition={{
                  duration: 0.4,
                  ease: [0.17, 0.67, 0.83, 0.67] as const,
                }}
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
            transition={{
              duration: 0.4,
              ease: [0.17, 0.67, 0.83, 0.67] as const,
            }}
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
            transition={{
              duration: 0.4,
              ease: [0.17, 0.67, 0.83, 0.67] as const,
            }}
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
                transition={{
                  duration: 0.5,
                  ease: [0.17, 0.67, 0.83, 0.67] as const,
                }}
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

          <motion.div
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.17, 0.67, 0.83, 0.67] as const,
            }}
          >
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="whatsappNumber">
                    WhatsApp number (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="whatsappNumber"
                      type="tel"
                      inputMode="tel"
                      placeholder="+20 100 000 0000"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappConsent"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-row items-start gap-3 space-y-0 rounded-lg border border-zinc-200 p-3">
                  <FormControl>
                    <Checkbox
                      id="whatsappConsent"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className="mt-0.5"
                    />
                  </FormControl>
                  <Label
                    htmlFor="whatsappConsent"
                    className="text-xs font-normal leading-5 text-muted-foreground"
                  >
                    I agree to receive occasional QuizRx updates, beta
                    communications, and invitations to future learning modules
                    by WhatsApp. I can opt out at any time.
                  </Label>
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            className="grid gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.17, 0.67, 0.83, 0.67] as const,
            }}
          >
            <FormField
              control={form.control}
              name="examPreparation"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Which exam are you preparing for? (optional)
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXAM_PREPARATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            loading={loading}
          >
            Sign Up
          </Button>

          <p className="text-xs text-muted-foreground leading-5">
            By creating an account, you agree that QuizRx stores your profile,
            chat history, and generated questions to deliver and improve the
            experience. Read our{" "}
            <Link href="/privacy-policy" className="text-primary underline">
              privacy notice
            </Link>
            .
          </p>
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
          Sign In
        </Link>
      </motion.div>
    </motion.div>
  );
}
