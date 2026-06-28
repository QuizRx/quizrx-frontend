"use client";

import { LegalPageShell } from "@/modules/landing/components/legal-page-shell";

export default function CookiesPolicyPage() {
  return (
    <LegalPageShell title="Cookies Policy" lastUpdated="June 2026">
      <p>
        This page explains how QuizRx uses cookies and similar technologies
        during the closed beta. We keep cookie use minimal and only set what is
        needed to run the product.
      </p>

      <h2>What is a cookie?</h2>
      <p>
        A cookie is a small text file that a website asks your browser to
        store. We also use comparable browser storage mechanisms (such as
        localStorage) for the same purposes described below.
      </p>

      <h2>Cookies we use</h2>
      <ul>
        <li>
          <strong>Authentication cookie</strong> - set after you sign in so the
          site remembers your session. This is essential for the product to
          work.
        </li>
        <li>
          <strong>Preference storage</strong> - we use localStorage to remember
          things like the timing of the in-app feedback prompt so we don't
          re-ask you too often.
        </li>
        <li>
          <strong>Hosting / security</strong> - our hosting providers may set
          cookies that protect against abuse and keep the service available.
        </li>
      </ul>

      <h2>What we do not use</h2>
      <ul>
        <li>No third-party analytics during the closed beta.</li>
        <li>No advertising or cross-site tracking cookies.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can clear cookies and storage from your browser settings at any
        time. Doing so will sign you out of QuizRx and reset session state.
      </p>

      <h2>Updates</h2>
      <p>
        If we change how we use cookies, we will update this page and adjust
        the "last updated" date above.
      </p>
    </LegalPageShell>
  );
}
