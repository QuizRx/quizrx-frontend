import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Separator } from "@/core/components/ui/separator";
import { Button } from "@/core/components/ui/button";
import React from "react";
import { useAuth } from "@/core/providers/auth";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/core/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { staggerUpAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";
import PaymentComponent from "./payment";
interface FreeTrialEndDialogProps {
  open: boolean;
  onSubscribe: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function TrialEndedState({ onLogout, onSubscribe, loading }: { onLogout: () => void; onSubscribe: () => void; loading?: boolean }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Your Access Has Pause!</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Your Free trial has ended.<br />
          To resume access, please subscribe to a plan
        </DialogDescription>
      </DialogHeader>
      <Separator className="my-4" />
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={onLogout} disabled={loading}>
          Log Out
        </Button>
        <Button variant="default" onClick={onSubscribe} disabled={loading}>
          {loading ? "Loading..." : "Subscribe"}
        </Button>
      </div>
    </>
  );
}

function SubscribeState({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <motion.div
      variants={zoomUpAnimation}
      className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6"
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
              onClick={onGetStarted}
            >
              Get Started
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const FreeTrialEndDialog: React.FC<FreeTrialEndDialogProps> = ({
  open,
  onCancel,
  loading,
}) => {
  const { signOut } = useAuth();
  const { push } = useRouter();
  const [state, setState] = React.useState<'default' | 'subscribe' | 'payment'>("default");

  const handleLogout = () => {
    signOut();
    if (onCancel) onCancel();
  };

  const handleSubscribeClick = () => {
    setState("subscribe");
  };

  const handleGetStarted = () => {
    setState("payment");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md bg-card"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {state === "default" && (
          <TrialEndedState onLogout={handleLogout} onSubscribe={handleSubscribeClick} loading={loading} />
        )}
        {state === "subscribe" && (
          <SubscribeState onGetStarted={handleGetStarted} />
        )}
        {state === "payment" && (
            <PaymentComponent />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FreeTrialEndDialog;
