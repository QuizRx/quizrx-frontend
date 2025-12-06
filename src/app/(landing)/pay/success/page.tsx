"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/core/components/ui/card";
import { useStripe } from "@/core/hooks/use-stripe";
import { useSubscriptionStore } from "@/modules/landing/store/subscription";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, setStatus, clientSecret, reset } = useSubscriptionStore();
  const { stripe, isLoading: stripeLoading, error: stripeError } = useStripe();

  useEffect(() => {
    // Don't try to verify payment until Stripe is loaded
    if (stripeLoading || stripeError || !stripe) return;

    const verifyPayment = async () => {
      const paramClientSecret = searchParams.get(
        "payment_intent_client_secret"
      );

      // Use either URL param or stored client secret
      const secretToUse = paramClientSecret || clientSecret;

      if (!secretToUse) {
        setStatus("failed");
        return;
      }

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          secretToUse
        );

        switch (paymentIntent?.status) {
          case "succeeded":
            setStatus("success");
            break;
          case "processing":
            setStatus("processing");
            break;
          default:
            setStatus("failed");
            break;
        }
      } catch (error) {
        setStatus("failed");
        console.error(error);
      }
    };

    verifyPayment();

    // Cleanup subscription data after successful payment
    return () => {
      if (status === "success") {
        reset();
      }
    };
  }, [
    searchParams,
    clientSecret,
    setStatus,
    reset,
    status,
    stripe,
    stripeLoading,
    stripeError,
  ]);

  // Show loading while waiting for Stripe to initialize
  if (stripeLoading) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Loading payment status...</h2>
      </div>
    );
  }

  // Show error if Stripe failed to initialize
  if (stripeError || !stripe) {
    return (
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-center text-2xl">
            Payment Status Unavailable
          </CardTitle>
          <CardDescription className="text-center">
            We're unable to verify your payment status at this time. Please
            contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push("/support")}>
            Contact Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "processing") {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Processing your payment...</h2>
        <p className="text-muted-foreground mt-2">
          Please wait while we confirm your payment.
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Failed</CardTitle>
          <CardDescription className="text-center">
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.back()}>Return to Pricing</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-center text-2xl">
          Payment Successful!
        </CardTitle>
        <CardDescription className="text-center">
          Thank you for your subscription. You now have access to all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              reset();
              router.push("/dashboard");
            }}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              reset();
              router.push("/support");
            }}
          >
            Contact Support
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          A confirmation email has been sent to your email address.
        </p>
      </CardContent>
    </Card>
  );
}

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-semibold">Loading payment status...</h2>
    </div>
  );
}

// Main component with Suspense wrapper
function SuccessPage() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState />}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}

export default SuccessPage;
