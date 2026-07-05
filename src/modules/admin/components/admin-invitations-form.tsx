"use client";

import { useMutation } from "@apollo/client";
import { CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Textarea } from "@/core/components/ui/textarea";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { UserRole } from "@/modules/graph/types/api/enum";
import { ADMIN_INVITE_USER } from "../apollo/admin";
import type { BulkInviteResult, BulkInviteResultEntry } from "../types";

// Parses a free-form input string (comma, space, semicolon or newline
// separated) into a unique, lowercased, validated list of emails.
const parseEmails = (raw: string): { valid: string[]; invalid: string[] } => {
  const tokens = raw
    .split(/[\s,;]+/g)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    if (re.test(t)) valid.push(t);
    else invalid.push(t);
  }
  return { valid, invalid };
};

// Best-effort guess at first/last from the local-part of an email, e.g.
// "alice.smith@x.com" -> { firstName: "Alice", lastName: "Smith" }
const guessName = (email: string): { firstName: string; lastName: string } => {
  const local = email.split("@")[0] || "New";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const cap = (s: string) =>
    s.length === 0 ? "" : s.charAt(0).toUpperCase() + s.slice(1);
  const firstName = cap(parts[0] || "New");
  const lastName = parts.length > 1 ? cap(parts[parts.length - 1]) : "User";
  return { firstName, lastName };
};

export function AdminInvitationsForm() {
  const [raw, setRaw] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<BulkInviteResult | null>(null);

  const { valid, invalid } = useMemo(() => parseEmails(raw), [raw]);

  const [inviteUser] = useMutation(ADMIN_INVITE_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid.length === 0) {
      toast({
        title: "No valid emails",
        description: "Enter at least one valid email address.",
      });
      return;
    }

    setSubmitting(true);
    const results: BulkInviteResultEntry[] = [];

    // Sequential rather than parallel — the backend creates a Firebase
    // user and sends an email for each invite, so we'd rather be polite
    // than DoS the email provider.
    //
    // IMPORTANT: the app-wide Apollo client is configured with
    // `errorPolicy: "all"`, which means GraphQL errors do NOT throw —
    // they come back in `result.errors`. We must check that explicitly,
    // otherwise every failed invite would be reported as success.
    for (const email of valid) {
      const { firstName, lastName } = guessName(email);
      try {
        const res = await inviteUser({
          variables: {
            inviteUserInput: { email, firstName, lastName, role },
          },
        });

        const gqlErrors = res?.errors;
        if (gqlErrors && gqlErrors.length > 0) {
          results.push({
            email,
            ok: false,
            error: gqlErrors[0].message || "Server error",
          });
        } else if (res?.data?.inviteUser === undefined || res?.data?.inviteUser === null) {
          results.push({
            email,
            ok: false,
            error: "No response from server",
          });
        } else {
          results.push({ email, ok: true });
        }
      } catch (err) {
        // Network error or thrown error — only reached when Apollo can't
        // get a response at all.
        const message =
          err instanceof Error ? err.message : "Unknown error";
        results.push({ email, ok: false, error: message });
      }
    }

    const result: BulkInviteResult = {
      totalRequested: valid.length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    };
    setLastResult(result);
    setSubmitting(false);

    if (result.succeeded === 0) {
      toast({
        title: `All ${result.totalRequested} invitation${result.totalRequested === 1 ? "" : "s"} failed`,
        description:
          result.results[0]?.error ||
          "See the details below for the server's error message.",
        variant: "destructive",
      });
    } else if (result.failed > 0) {
      toast({
        title: `${result.succeeded} of ${result.totalRequested} sent`,
        description: `${result.failed} failed — see the details below.`,
      });
    } else {
      toast({
        title: `${result.succeeded} invitation${result.succeeded === 1 ? "" : "s"} sent`,
        description: "All emails went out successfully.",
      });
      setRaw("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <Label htmlFor="invite-emails" className="text-sm font-medium">
          Emails to invite
        </Label>
        <p className="mt-1 text-xs text-zinc-500">
          Separate addresses with commas, semicolons, spaces, or new lines.
        </p>
        <Textarea
          id="invite-emails"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          placeholder={
            "alice@example.com\nbob@example.com, charlie@example.com"
          }
          className="mt-3 font-mono text-sm"
          disabled={submitting}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
            {valid.length} valid
          </span>
          {invalid.length > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
              {invalid.length} invalid
            </span>
          )}
          {invalid.length > 0 && (
            <span className="text-zinc-500">
              Invalid:{" "}
              <span className="font-mono">
                {invalid.slice(0, 3).join(", ")}
                {invalid.length > 3 ? "..." : ""}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-role" className="text-sm font-medium">
            Default role
          </Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            disabled={submitting}
          >
            <SelectTrigger id="invite-role" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
              <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
              <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={submitting || valid.length === 0}
          className="gap-2"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting
            ? "Sending..."
            : `Send ${valid.length} invitation${valid.length === 1 ? "" : "s"}`}
        </Button>
      </div>

      {lastResult && (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Last batch</p>
              <p className="text-xs text-zinc-500">
                {lastResult.succeeded} succeeded · {lastResult.failed} failed ·{" "}
                {lastResult.totalRequested} total
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLastResult(null)}
            >
              Dismiss
            </Button>
          </div>
          <ul className="divide-y divide-zinc-100">
            {lastResult.results.map((r) => (
              <li
                key={r.email}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
              >
                <span className="font-mono text-xs">{r.email}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    r.ok ? "text-emerald-700" : "text-rose-700"
                  )}
                >
                  {r.ok ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sent
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      {r.error || "Failed"}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
