"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { useStripe } from "@/core/hooks/use-stripe";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Label } from "@/core/components/ui/label";
import { ProjectLogo } from "@/core/components/ui/logo";
import { toast } from "@/core/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  zoomInAnimation,
  zoomUpAnimation,
  staggerUpAnimation,
} from "@/core/utils/animations/motion";
import { motion } from "motion/react";
import { useUser } from "@/core/providers/user";
import type { Stripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";
import { useRequireStatus } from "@/core/hooks/use-require-status";

const MotionCard = motion(Card);
const MotionDiv = motion.div;

export type StripeCustomerResponse = {
  id: string;
  email: string;
  customerId: string;
};

const CREATE_STRIPE_CUSTOMER = gql`
  mutation CreateStripeCustomer {
    createStripeCustomer {
      id
      email
      name
    }
  }
`;

const CREATE_STRIPE_SETUP_INTENT = gql`
  mutation {
    createStripeSetupIntent {
      clientSecret
      setupIntentId
    }
  }
`;

const SUBSCRIBE_STRIPE_TO_PLAN = gql`
mutation SubscribeToPlan($priceId: String!, $paymentMethodId: String!, $isTrial: Boolean) {
  subscribeToPlan(
    priceId: $priceId,
    paymentMethodId: $paymentMethodId,
    isTrial: $isTrial
  )
}
`

const PaymentLayout = () => {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<string | null>(null);
  const router = useRouter();
  useRequireStatus('/dashboard', 'PENDING_SUBSCRIPTION', 'You already have a subscription', 'You already have a subscription.');

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (!planParam || (planParam !== "trial" && planParam !== "full")) {
      router.replace("/subscribe");
    }
    setPlan(planParam);
  }, [searchParams, router]);

  const { user, refetch } = useUser();
  const { stripe, isLoading: stripeLoading } = useStripe();

  const [agreed, setAgreed] = useState(false);
  const [country, setCountry] = useState("us");
  const [createCustomer] = useMutation<{ createStripeCustomer: StripeCustomerResponse }, { id: string }>(CREATE_STRIPE_CUSTOMER);
  const [createSetupIntent] = useMutation<{ createStripeSetupIntent: { clientSecret: string, setupIntentId: string } }>(CREATE_STRIPE_SETUP_INTENT);
  const [subscribeToPlan] = useMutation(SUBSCRIBE_STRIPE_TO_PLAN);
  const [processing, setProcessing] = useState(false);

  // refs para Stripe Elements
  const elementsRef = useRef<StripeElements | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);

  // monta o Card Element manualmente quando o Stripe estiver pronto
  useEffect(() => {
    if (!stripe || cardElement || !cardContainerRef.current) return;

    elementsRef.current = stripe.elements();
    if (!elementsRef.current) return;
    const card = elementsRef.current.create("card", { hidePostalCode: true });
    card.mount(cardContainerRef.current);
    setCardElement(card);

    return () => {
      card.destroy();
    };
  }, [stripe]);

  const handleSubscribe = async () => {
    await refetch();
    if (!stripe || !cardElement) return;
    setProcessing(true);
    let customerId: string | undefined = user?.stripeCustomerId;
    if (customerId === "undefined" || !customerId) {
      const {data , errors} = await createCustomer();
      if (errors || !data?.createStripeCustomer) {
        toast({
          title: "Error",
          description: errors?.[0]?.message || "Failed to create Stripe customer",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }
      customerId = data.createStripeCustomer.customerId;
    }
    
    const { data: dataSetup, errors : errorSetup } = await createSetupIntent();
    if (errorSetup || !dataSetup?.createStripeSetupIntent) {
      toast({
      title: "Error",
      description: errorSetup?.[0]?.message || "Failed to subscribe to plan",
      variant: "destructive",
    });
      setProcessing(false);
      return;
    }

    
    const { setupIntent, error: errorStripe } = await stripe.confirmCardSetup(
    dataSetup.createStripeSetupIntent.clientSecret,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: user? user.firstName + " " + user.lastName : "Anonymous User",
          email: user?.email || "",
          address: {
            // ISO-3166 alpha-2 code, e.g. “US”, “BR”, “DE”
            country,
          },
        },
      },
    }
);
    if (errorStripe) {
      toast({
      title: "Error",
      description: errorStripe?.[0]?.message || "Failed to subscribe to plan",
      variant: "destructive",
    });
      setProcessing(false);
      return;
    }

    // 3. Cria assinatura no backend
    const { data: dataSubscription, errors: errorSubscription } = await subscribeToPlan({
      variables: {
        priceId: "price_1RbQFEQspy3yc92G9SRGdW92", //id of subscription in stripe
        isTrial: plan === "trial",
        paymentMethodId: setupIntent.payment_method,
      },
    });
    if (errorSubscription || ( plan !== "trial" && !dataSubscription)) {
      toast({
      title: "Error",
      description: errorSubscription?.[0]?.message || "Failed to subscribe to plan",
      variant: "destructive",
    });
      setProcessing(false);
      return;
    }
    if(plan !== "trial") {
      const {data, error} = await stripe.confirmCardPayment(dataSubscription.subscribeToPlan)
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to confirm card payment",
          variant: "destructive",
        });
        setProcessing(false);
        await refetch();

        return;
      }
    }

    await refetch();
    setProcessing(false);
    router.push("/dashboard");
  };

  return (
    <MotionDiv
      variants={zoomInAnimation}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-background flex flex-col items-center justify-center p-8"
    >
      <header className="flex flex-col items-center gap-4 mb-8">
        <ProjectLogo includeText size={20} />
        <p className="text-muted-foreground text-sm">EBEEDM Exam Track</p>
      </header>

      <main className="flex flex-col items-center justify-center w-full">
        <MotionCard
          variants={zoomUpAnimation}
          className="w-full max-w-md mx-auto p-6 rounded-md bg-card"
        >
          <MotionDiv variants={zoomInAnimation} className="space-y-6">
            <MotionDiv
              variants={staggerUpAnimation}
              className="text-center space-y-2"
            >
              <h1 className="text-2xl font-bold">Payment Information</h1>
              <p className="text-muted-foreground text-sm">
                Enter your payment details to start your subscription
              </p>
            </MotionDiv>

            {/* Card Element container */}
            <div className="p-3 border rounded bg-background" ref={cardContainerRef} />

            {/* Select Country */}
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select Your Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
              </SelectContent>
            </Select>

            {/* Termos */}
            <MotionDiv
              variants={staggerUpAnimation}
              className="flex items-start space-x-2 pt-2"
            >
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-tight">
                I agree to the 3‑month minimum commitment and understand that I
                will be billed $9.99 monthly
              </Label>
            </MotionDiv>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={!agreed || processing || stripeLoading}
              >
                {processing ? "Processing…" : "Start My Subscription"}
              </Button>
              <Button
                variant="outline"
                className="w-full text-muted-foreground"
                onClick={() => router.back()}
                type="button"
              >
                Go Back
              </Button>
            </div>
          </MotionDiv>
        </MotionCard>
      </main>

      <footer className="px-4 text-center pt-8">
        <p className="text-xs text-muted-foreground">© 2025 Quiz RX. All rights reserved.</p>
      </footer>
    </MotionDiv>
  );
};

export default PaymentLayout;
