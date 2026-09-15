"use client";

import { ProjectLogo } from "@/core/components/ui/logo";
import { ForgotPasswordForm } from "@/modules/landing/components/forms/auth/forgot-password";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10  px-8 pb-8 pt-10">
      <div className="w-full max-w-sm pt-8 sm:pt-16">
        <div className="flex flex-col items-center gap-2 mb-10">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <ProjectLogo size={50} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold mb-3">Forgot your password?</h1>
            <p className="text-md font-normal">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
