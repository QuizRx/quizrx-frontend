"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqItems?: FAQItem[];
  showContactSection?: boolean;
  contactEmail?: string;
  className?: string;
}

const defaultFaqItems: FAQItem[] = [
  {
    question: "Why is there a 3-month minimum commitment?",
    answer:
      "We require a 3-month minimum commitment to ensure you have enough time to see meaningful progress in your EBEEDM exam preparation. This timeframe allows you to complete our comprehensive study program and take advantage of all the features we offer.",
  },
  {
    question: "Can I cancel after 3 months?",
    answer:
      "Yes, absolutely! After the initial 3-month commitment period, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.",
  },
  {
    question: "Can I customize my own quizzes?",
    answer:
      "Yes! Our platform allows you to create custom quizzes based on specific topics, difficulty levels, and question types. You can focus on areas where you need the most practice.",
  },
  {
    question: "Do you offer a trial?",
    answer:
      "Yes, we offer a 3-day free trial that gives you full access to our EBEEDM question bank and detailed explanations. No payment is required to start, and you can cancel anytime during the trial period.",
  },
];

export function FAQSection({
  title = "FAQ",
  faqItems = defaultFaqItems,
  showContactSection = true,
  contactEmail = "helpquizrx@gmail.com",
  className = "",
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">{title}</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Collapsible
                key={index}
                open={openFaq === `faq-${index}`}
                onOpenChange={(open) =>
                  setOpenFaq(open ? `faq-${index}` : null)
                }
              >
                <CollapsibleTrigger className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {item.question}
                    </span>
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Plus
                        className={`h-4 w-4 text-white transition-transform ${
                          openFaq === `faq-${index}` ? "rotate-45" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-gray-600 mt-2">{item.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Still Have Questions */}
            {showContactSection && (
              <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">
                  Still Have Questions?
                </h3>
                <p className="text-gray-600 mb-2">
                  Can&apos;t find the answers you are looking for? Please chat
                  to our friendly team{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contactEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
