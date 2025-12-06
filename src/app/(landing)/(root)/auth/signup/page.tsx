"use client";

import { ProjectLogo } from "@/core/components/ui/logo";
import { SignupForm } from "@/modules/landing/components/forms/auth/signup";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  let inviteObj: { name?: string; email?: string } | undefined = undefined;
  const inviteRaw = searchParams.get("invite");
  if (inviteRaw) {
    try {
      inviteObj = JSON.parse(inviteRaw);
    } catch {}
  }
  const forceEmail = inviteObj?.email;
  const startingName = inviteObj?.name;
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
            <h1 className="text-xl font-bold mb-3">Create an account</h1>
            <p className="text-md font-normal">Begin your Journey with QuizRX</p>
          </div>
        </div>
        <SignupForm forceEmail={forceEmail} startingName={startingName}/>
      </div>
    </div>
  );
}
