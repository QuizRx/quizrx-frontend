import { useMutation } from "@apollo/client";
import { CREATE_PAYMENT_INTENT } from "@/modules/landing/apollo/mutation/subscription";
import { useSubscriptionStore } from "@/modules/landing/store/subscription";
import { SubscriptionData } from "@/modules/landing/types/api/subscription";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import { useToast } from "@/core/hooks/use-toast";
import { SignupForm } from "../forms/auth/signup";
import { ProjectLogo } from "@/core/components/ui/logo";

const PricingCard = (props: {
  mode: "monthly" | "annual";
  data: SubscriptionData;
}) => {
  const { setSubscriptionId, setClientSecret, status, email } =
    useSubscriptionStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);

  const handleSubscription = async () => {
    setSubscriptionId(props.data._id);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    try {
      async function initPayment() {
        if (status === "processing") {
          // Create payment intent
          const { data } = await createPaymentIntent({
            variables: {
              createStripeInput: {
                amount: props.data.pricing,
                currency: "usd",
                email,
              },
            },
          });

          // Store client secret
          setClientSecret(data?.createStripePayment?.clientSecret!);

          //   Navigate to payment page
          router.push("/pay");
        }
      }

      initPayment();
    } catch (error) {
      toast({
        title: "Failed to initialize payment",
        description: "Please try again or contact support",
        variant: "destructive",
      });
      // Reset subscription ID on error
      setSubscriptionId("");
    }
  }, [status]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
    >
      <Card className="rounded-xl w-72 shadow-xl">
        {props.data.isPopular && (
          <div className="bg-gradient-to-r from-primary via-primary/70 to-primary text-background text-xs text-center py-2 rounded-t-xl">
            Most Popular Plan
          </div>
        )}
        <CardTitle className="p-4 flex flex-col gap-2 items-center justify-center">
          <p className="text-2xl font-semibold">
            ${props.data.pricing}/{props.mode === "monthly" ? "mth" : "yr"}
          </p>
        </CardTitle>
        <CardContent className="p-4 flex flex-col gap-1 items-center justify-center">
          <p className="font-semibold">{props.data.name}</p>
          <p className="text-sm text-muted-foreground">{props.data.subtitle}</p>
        </CardContent>
        <CardDescription className="p-4 flex flex-col gap-2 items-center justify-center">
          {props.data.details.map((detail, index) => (
            <div
              key={`${props.data._id}-detail-${index}`}
              className="flex flex-row gap-2 items-center justify-evenly w-full"
            >
              <CheckCircle className="text-green-600 w-5 h-5" />
              <p className="font-medium text-sm">{detail}</p>
            </div>
          ))}
        </CardDescription>
        <CardFooter className="p-4 flex flex-col gap-2 items-center justify-center">
          <DialogTrigger className="w-full">
            <Button
              className="w-full rounded-sm font-medium"
              onClick={handleSubscription}
            >
              Get Started
            </Button>
          </DialogTrigger>
          <Button variant="outline" className="w-full rounded-sm font-medium">
            Chat to sales
          </Button>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogTitle className="mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md z-10">
            <ProjectLogo size={500} />
          </div>
          <p className="text-2xl font-medium">Create Your Account</p>
        </DialogTitle>
        <DialogDescription className="text-center">
          You're just one step away from completing your{" "}
          {props.mode === "monthly" ? "monthly" : "annual"} subscription for{" "}
          <span className="font-semibold text-primary text-lg">
            {props.data.name} ${props.data.pricing}/
            {props.mode === "monthly" ? "mo" : "yr"}
          </span>
        </DialogDescription>
        <SignupForm />
      </DialogContent>
    </Dialog>
  );
};

export default PricingCard;
