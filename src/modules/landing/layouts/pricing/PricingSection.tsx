"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  zoomInAnimation,
  zoomUpAnimation,
  staggerUpAnimation,
} from "@/core/utils/animations/motion";

interface PricingPlan {
  name: string;
  price: string;
  priceSubtext: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
}

interface PricingSectionProps {
  showBadge?: boolean;
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  className?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    name: "Free Trial",
    price: "Free",
    priceSubtext: "for 3 days",
    description: "No payment required to start. Cancel anytime during trial.",
    features: [
      "Full access to EBEEDM question bank",
      "Detailed explanations for all questions",
      "Auto - Converts to $9.99/month after a free trial",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default",
  },
  {
    name: "Full Access Plan",
    price: "$9/mo",
    priceSubtext: "",
    description: "",
    features: [
      "Full access to EBEEDM question bank",
      "Detailed explanations for all questions",
      "Up to 10 automations",
      "Performance tracking and analytics",
      "Mobile and desktop access",
    ],
    buttonText: "Get Started",
    buttonVariant: "default",
  },
];

export function PricingSection({
  showBadge = true,
  title = "Get Full Access to EBEEDM Exam Prep",
  subtitle = "Everything you need to master EBEEDM - questions, mock exams, analytics & more",
  plans = defaultPlans,
  className = "",
}: PricingSectionProps) {
  const { push } = useRouter();

  return (
    <section className={`pt-32 pb-10 ${className}`}>
      <div
        className="max-w-7xl mx-auto px-4 pt-10 pb-20 sm:px-6 lg:px-8 rounded-2xl overflow-hidden"
        style={{
          backgroundImage: "url('/background/blur.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={zoomInAnimation}
          className="text-center"
        >
          {showBadge && (
            <Badge
              variant="outline"
              className="mb-6 bg-white text-gray-700 border-gray-200 px-4 py-1 rounded-full"
            >
              Pricing
            </Badge>
          )}
          <motion.h1
            variants={zoomUpAnimation}
            className="text-2xl sm:text-3xl lg:text-5xl text-gray-900 mb-6"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={zoomUpAnimation}
            className="text-lg text-gray-700 max-w-3xl mx-auto mb-12"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={zoomInAnimation}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={staggerUpAnimation}
              className="flex flex-col"
            >
              {/* Card exterior translúcido con título - solo la parte superior */}
              <div className="bg-white/40 backdrop-blur-sm rounded-t-3xl shadow-sm px-8 py-6 pb-10">
                <h3 className="text-2xl sm:text-3xl text-gray-900">
                  {plan.name}
                </h3>
              </div>

              {/* Card interior blanco con contenido */}
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 flex flex-col flex-grow -mt-6 relative z-10">
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl sm:text-4xl text-gray-900">
                      {plan.price}
                    </span>
                    {plan.priceSubtext && (
                      <span className="text-xl text-gray-600">
                        {plan.priceSubtext}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-base text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {index === 0 && plan.description && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                )}

                <Button
                  onClick={() => push("/auth/signup")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-medium"
                >
                  {plan.buttonText}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
