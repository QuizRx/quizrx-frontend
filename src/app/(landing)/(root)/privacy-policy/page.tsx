"use client";

import { LegalPageShell } from "@/modules/landing/components/legal-page-shell";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Notice" lastUpdated="June 2026">
      <p>
        QuizRx is a closed beta study tool for medical learners. This notice
        explains what we collect, why we collect it, and your choices while the
        beta is running.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          Account details (name, email, profile picture) provided by your
          identity provider when you sign in.
        </li>
        <li>
          The questions you ask, the choices you select, and the per-question
          feedback you submit so we can improve the calcium &amp; bone module.
        </li>
        <li>
          Basic technical data (browser, device type, time of access) for
          security and reliability.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To deliver the beta product and personalise your session.</li>
        <li>
          To analyse aggregate accuracy and feedback so we can fix or replace
          weak questions.
        </li>
        <li>To keep your account secure and prevent abuse.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell personal data. During beta we share data only with the
        infrastructure providers needed to run the service (authentication,
        hosting, database). We never share individual answers with other users.
      </p>

      <h2>Retention</h2>
      <p>
        Beta data is retained while the beta is active and for a short period
        afterwards so we can complete our analysis. You can request deletion at
        any time by contacting us.
      </p>

      <h2>Your choices</h2>
      <p>
        You can request access, correction, or deletion of your data by
        emailing the team via the <a href="/contact">Contact</a> page. You can
        also stop using the beta at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this notice? Reach out via the{" "}
        <a href="/contact">Contact</a> page and we'll get back to you.
      </p>
    </LegalPageShell>
  );
}
