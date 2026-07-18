"use client";

import { ProjectLogo } from "@/core/components/ui/logo";
import { ResetPasswordForm } from "@/modules/landing/components/forms/auth/reset-password";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10  px-8 pb-8 pt-10">
      <div className="w-full max-w-sm pt-16">
        <div className="flex flex-col items-center gap-2 mb-10">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <ProjectLogo size={50} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold mb-3">Set a new password</h1>
            <p className="text-md font-normal">
              Choose a strong password for your account
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading…</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
