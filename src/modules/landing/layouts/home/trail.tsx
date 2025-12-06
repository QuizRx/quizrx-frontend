import { motion } from "motion/react";
import { Background } from "@/core/components/ui/background";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { zoomInAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";

export default function FreeTrialSection() {
  return (
    <Background
      image="/background/trail.svg"
      className="w-full py-16 px-4 h-96 flex flex-col items-center justify-center rounded-3xl"
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={zoomInAnimation}
        className="flex flex-col gap-4 items-center text-center w-full sm:w-2/3 md:w-1/2 lg:w-1/3"
      >
        <Badge className="w-fit" variant="outline">
          Free Trial
        </Badge>

        <motion.h2
          variants={zoomUpAnimation}
          className="text-2xl sm:text-3xl md:text-4xl font-medium"
        >
          Try it out with our 3 days free trial
        </motion.h2>

        <motion.p
          variants={zoomUpAnimation}
          className="text-sm text-muted-foreground"
        >
          No credit card required
        </motion.p>

        <motion.div
          variants={zoomUpAnimation}
          className="w-full max-md:hidden flex flex-col sm:flex-row items-center gap-2 bg-background shadow-sm p-2 rounded-full"
        >
          <Input
            type="email"
            placeholder="Your Email"
            className="bg-background border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full flex-1"
          />
          <Button className="w-full sm:w-auto rounded-full">Try Demo</Button>
        </motion.div>
        <motion.div
          variants={zoomUpAnimation}
          className="flex flex-col gap-4 md:hidden"
          >
          <Input
            type="email"
            placeholder="Your Email"
            className="bg-background border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full flex-1"
          />
          <Button className="w-full sm:w-auto rounded-full">Try Demo</Button>
        </motion.div>
      </motion.div>
    </Background>
  );
}
