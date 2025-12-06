"use client";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { ProjectLogo } from "@/core/components/ui/logo";
import {
  staggerUpAnimation,
  zoomInAnimation,
  zoomUpAnimation,
} from "@/core/utils/animations/motion";
import { Check, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRequireStatus } from "@/core/hooks/use-require-status";

const SubscriptionPlanLayout = () => {
  const { back, push } = useRouter();
  useRequireStatus('/dashboard', 'PENDING_SUBSCRIPTION', 'You already have a subscription', 'You already have a subscription.');
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-8"
    >
      <motion.header
        variants={staggerUpAnimation}
        className="flex flex-col items-center gap-4 mb-8"
      >
        <ProjectLogo includeText size={20} />
        <p className="text-muted-foreground text-sm">EBEEDM Exam Track</p>
      </motion.header>

      <main className="w-full max-w-4xl border border-gray-200 rounded-lg bg-card mb-8">
        <div className="w-full space-y-6 py-8 px-16 md:py-10 md:px-20">
          <motion.div
            variants={staggerUpAnimation}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl md:text-3xl font-bold">Choose your plan</h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium">
              Select the best subscription option for your EBEEDM exam
              preparation
            </p>
          </motion.div>

          <motion.div
            variants={zoomUpAnimation}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6"
          >
            {/* First Card */}
            <Card className="relative bg-blue-50 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    3 - Day Free Trial
                  </CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-4xl px-3 py-1 text-xs"
                  >
                    Try Free
                  </Button>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-bold">Free</span>
                  <span className="text-muted-foreground"> for 3 days</span>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="border-t border-gray-200 my-2"></div>
                {[
                  "Full access to EBEEDM question bank",
                  "Detailed explanations for all questions",
                  "Auto - Converts to $9.99/month after a free trial",
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
                <div className="border-t border-gray-200 mt-2 pt-4">
                  <p className="text-sm text-muted-foreground">
                    No payment required to start. Cancel anytime during trial.
                  </p>
                </div>
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
                    onClick={() => push("/pay?plan=trial")}
                  >
                    Start Free Trial
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>

            {/* Second Card */}
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
                {[
                  "Full access to EBEEDM question bank",
                  "Detailed explanations for all questions",
                  "Performance tracking and analytics",
                  "Mobile and desktop access",
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
                    onClick={() => push("/pay?plan=full")}>
                    Get Started
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>

          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => back()}
              className="text-muted-foreground flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>
          </div>
        </div>
      </main>

      <motion.footer
        variants={staggerUpAnimation}
        className="text-center py-2 px-4"
      >
        <p className="text-xs text-muted-foreground">
          © 2025 Quiz RX. All rights reserved.
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default SubscriptionPlanLayout;
