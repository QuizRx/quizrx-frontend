"use client";

import { LegalPageShell } from "@/modules/landing/components/legal-page-shell";

const SUPPORT_EMAIL = "beta@quizrx.ai";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Notice" lastUpdated="July 2026">
      <p>
        QuizRx is a closed beta study tool for medical learners. This notice
        explains what we collect, why, and your choices while the beta is
        running.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>Account details (name, email, profile picture) from sign-in.</li>
        <li>
          The questions you ask, the choices you select, and the feedback you
          submit, so we can improve the module.
        </li>
        <li>If you choose to provide it, we may store your WhatsApp number.</li>
        <li>
          Basic technical data (browser, device type, time of access) for
          security and reliability.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To deliver the beta and personalise your session.</li>
        <li>To analyse accuracy and feedback so we can improve questions.</li>
        <li>To keep your account secure and prevent abuse.</li>
        <li>
          If you opt in, we may contact you via WhatsApp regarding beta updates,
          feedback requests, and future QuizRx releases.
        </li>
      </ul>

      <h2>Essential Cookies</h2>
      <p>
        QuizRx uses only essential cookies and similar technologies required to
        keep the site secure, maintain your session, and ensure the beta
        functions properly. We do not use advertising or cross-site tracking
        cookies during the beta.
      </p>

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
        any time.
      </p>

      <h2>Your choices &amp; contact</h2>
      <p>
        To request access, correction, or deletion of your data - or if you have
        any questions about this notice - email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. You can stop
        using the beta at any time.
      </p>
    </LegalPageShell>
  );
}
