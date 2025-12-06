import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/providers/auth";
import { useUser } from "@/core/providers/user";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/core/components/ui/dialog";
import React from "react";
import { Check } from "lucide-react";
import { Separator } from "@/core/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/core/components/ui/card";
import { motion } from "motion/react";
import { staggerUpAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";

import PaymentComponent from "@/modules/subscription/components/payment";
import { set } from "date-fns";


type statusMessagesType = {
  status: string;
  title: string;
  secondTitle: string;
  message: string;
  buttonMessage: string;
  paymentMessage?: string;
};

function StatusState({ onLogout, nextPhase, loading, content }: { onLogout: () => void; nextPhase: () => void; loading?: boolean, content: statusMessagesType }) {
  return (
    <>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button variant="outline" onClick={onLogout} disabled={loading}>
          Log Out
        </Button>
        <Button variant="default" onClick={() => nextPhase()} disabled={loading}>
          {loading ? "Loading..." : content.buttonMessage}
        </Button>
      </div>
    </>
  );
}

function SubscribeState({ nextPhase, goBack }: { goBack: () => void, nextPhase: () => void }) {
  return (
    <div
      className="grid grid-cols-1  gap-10 mb-6"
    >
      <Card className="relative flex flex-col h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              EBEEDM Full Access
            </CardTitle>
            <Button
              variant="default"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 text-blue-500 rounded-4xl px-3 py-1 text-xs"
            >
              Full Access
            </Button>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-bold">$9.99</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="border-t border-gray-200 my-2"></div>
          { [
            "Full access to EBEEDM question bank",
            "Detailed explanations for all questions",
            "Performance tracking and analytics",
            "Mobile and desktop access"
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={staggerUpAnimation}
              custom={index}
              className="flex items-center gap-3 py-2"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Check className="w-5 h-5 text-blue-500" />
              </motion.span>
              <span className="text-sm text-muted-foreground">
                {feature}
              </span>
            </motion.div>
          ))}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-6 w-full">
          <motion.div
            variants={staggerUpAnimation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
              onClick={() => nextPhase()}
            >
              Next
            </Button>
          </motion.div>
           <Button
              className="w-full"
              variant={"outline"}
              size="lg"
              onClick={goBack}
            >
              Go back
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}




export function useRequireSubscription() {
  const { userSubscription, loading } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [state, setState] = useState<'default' | 'subscribe' | 'payment'>('default');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
      setShowDialog(false);
      setStatus(null);
      return;
    }
    if (!loading && userSubscription && userSubscription.status !== 'ACTIVE' && userSubscription.status !== 'TRIALING') {
      setStatus(userSubscription.status);
      setShowDialog(true);
      setState('default');
    } else {
      setShowDialog(false);
      setStatus(null);
      setState('default');
    }
  }, [userSubscription, loading]);

  const handleLogout = () => {
    signOut();
  };

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    router.refresh();
  };

  const statusMessages: Record<string, statusMessagesType> = {
    PAYMENT_PENDING: {
      status: 'PAYMENT_PENDING',
      title: 'Payment Pending',
      secondTitle: 'Actual subscription',
      message: 'Your payment is pending. Please complete your payment to continue using the service.',
      buttonMessage: 'Complete Payment',
      paymentMessage: "Complete Payment"
    },
    CANCELED: {
      status: 'CANCELED',
      title: 'Subscription Canceled',
      secondTitle: 'Subscribe to a new plan',
      message: 'Your subscription has been canceled. Please subscribe to regain access.',
      buttonMessage: 'Subscribe Now',
      paymentMessage: "Start Subscription"
    },
    RETRYING_PAST_DUE: {
      status: 'RETRYING_PAST_DUE',
      title: 'Retrying Payment',
      secondTitle: 'Actual plan',
      message: 'We are retrying your past due payment. Please update your payment method if needed.',
      buttonMessage: 'Retry Payment',
      paymentMessage: "Complete Payment"
    },
    EXPIRED: {
      status: 'EXPIRED',
      secondTitle: 'Subscribe to a new plan',
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Please renew to regain access.',
      buttonMessage: 'Subscribe Now',
      paymentMessage: "Start Subscription"
    },
    SUSPENDED_UNPAID: {
      status: 'SUSPENDED_UNPAID',
      secondTitle: 'Subscribe to a new plan',
      title: 'Suspended: Unpaid',
      message: 'Your subscription is suspended due to unpaid invoices. Please resolve your payment to continue.',
      buttonMessage: 'Resolve Payment',
      paymentMessage: "Complete Payment"
    },
  };

  const DialogComponent = React.useMemo(() => {
    if (!showDialog || !status) return null;
    const content = statusMessages[status] || statusMessages['PAYMENT_PENDING'];
    return (
      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">{state === "default" && content.title}
              {state === "subscribe" && content.secondTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-lg">
              {state === "default" && content.message}
            </DialogDescription>
          </DialogHeader>
          {state === 'default' && (
            <StatusState onLogout={handleLogout} nextPhase={() => setState('subscribe')} loading={loading} content={content} />
          )}
          {state === 'subscribe' && (
            <SubscribeState nextPhase={() => setState('payment')}  goBack={() => setState('default')}/>
          )}
          {state === 'payment' && (
            <PaymentComponent onPayment={async (_test) =>{ handleRefresh() }} goBack={() => setState('subscribe')} textPayment={content.paymentMessage}/>
          )}
        </DialogContent>
      </Dialog>
    );
  }, [showDialog, status, state, loading, userSubscription]);

  return { loading, DialogComponent };
}


