import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { Background } from "@/core/components/ui/background";
import {
  zoomInAnimation,
  zoomUpAnimation,
} from "@/core/utils/animations/motion";
import { CircleHelp } from "lucide-react";
import { motion } from "motion/react";

export default function FAQSection() {
  const faqItems = [
    {
      question: "Why is there a 3-month minimum commitment?",
      answer:
        "We offer a 3-month minimum commitment to ensure you have enough time to fully experience the benefits of our platform and see meaningful results in your learning progress.",
    },
    {
      question: "Can I cancel after 3 months?",
      answer:
        "Yes, you can cancel your subscription at any time after the initial 3-month period. There are no long-term contracts or cancellation fees.",
    },
    {
      question: "Can I customize my own quizzes?",
      answer:
        "Yes! All plans allow you to create custom quizzes. You can add your own questions, import questions from our library, set time limits, and customize the appearance to match your brand.",
    },
    {
      question: "Do you offer a trial?",
      answer:
        "Yes, we offer a 3-day free trial with no credit card required. You can experience all features during this period and decide if our platform is right for you.",
    },
  ];

  return (
    <motion.div
      id="faq"
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="relative w-full bg-primary/5 py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl"
    >
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left side - FAQ heading */}
            <div className="lg:col-span-3">
              <motion.h2
                variants={zoomUpAnimation}
                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900"
              >
                FAQ
              </motion.h2>
            </div>

            {/* Right side - Questions */}
            <div className="lg:col-span-9">
              <div className="space-y-3 sm:space-y-4">
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                >
                  {faqItems.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="bg-white rounded-lg shadow-sm border-none"
                    >
                      <AccordionTrigger className="p-4 sm:p-6 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">+</span>
                          </div>
                          <span className="font-medium text-sm sm:text-base text-gray-900">
                            {item.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 sm:px-12 pb-4 pt-0 text-muted-foreground text-sm sm:text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 mt-4 sm:mt-6 text-center shadow-sm">
                  <motion.h3
                    variants={zoomUpAnimation}
                    className="font-medium mb-2 text-sm sm:text-base text-gray-900"
                  >
                    Still Have Questions?
                  </motion.h3>
                  <motion.p
                    variants={zoomUpAnimation}
                    className="text-xs sm:text-sm text-gray-600"
                  >
                    Can't find the answers you are looking for? Please, chat to our friendly team{" "}
                    <a
                      href="mailto:helpquizrx@gmail.com"
                      className="text-blue-600 hover:underline"
                    >
                      helpquizrx@gmail.com
                    </a>
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
