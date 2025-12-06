"use client";

import { Check, ArrowRight, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Card, CardContent } from "@/core/components/ui/card";
import {
  zoomInAnimation,
  zoomUpAnimation,
  staggerUpAnimation,
} from "@/core/utils/animations/motion";
import { useState } from "react";
import Image from "next/image";

export default function AboutUsPage() {
  const { push } = useRouter();
  const [email, setEmail] = useState("");

  const metrics = [
    {
      number: "500+",
      label: "Users who've signed up or tested the platform",
    },
    {
      number: "10,000+",
      label: "Solved questions in our database",
    },
    {
      number: "15+",
      label: "Number of focused medical subtopics",
    },
  ];

  const features = [
    {
      icon: "💎",
      title: "Smart Learning",
      description:
        "Smart learning with personalized quiz logic designed to reinforce knowledge through spaced repetition and cognitive recall",
    },
    {
      icon: "💎",
      title: "Clinical Relevance",
      description:
        "Clinical relevance first, every question is carefully curated with medical accuracy and exam-readiness in mind",
    },
    {
      icon: "💎",
      title: "Modular Topics",
      description:
        "Modular medical topics that break down complex subjects into digestible, focused learning modules",
    },
    {
      icon: "💎",
      title: "Interactive Learning",
      description:
        "Interactive learning through smart quizzes that adapt to your learning pace and identify knowledge gaps",
    },
  ];

  const teamMembers = [
    {
      name: "Dr. Barry",
      title: "CEO",
      image: "/modules/avatar/alessandra.webp",
    },
    {
      name: "Dr. Smith",
      title: "CTO",
      image: "/modules/avatar/lydia.webp",
    },
    {
      name: "Dr. Johnson",
      title: "Medical Director",
      image: "/modules/avatar/alessandra.webp",
    },
  ];

  const testimonials = [
    {
      title: "Game Changer!",
      quote:
        "Quiz Rx transformed the way we assess our medical exams. The AI-driven insights are invaluable.",
      author: "Dr. Sarah Wilson",
      role: "Medical Student",
      avatar: "/modules/avatar/alessandra.webp",
    },
    {
      title: "Incredible Platform",
      quote:
        "The personalized learning approach helped me master endocrinology concepts I struggled with for months.",
      author: "Dr. Michael Chen",
      role: "Resident",
      avatar: "/modules/avatar/lydia.webp",
    },
    {
      title: "Best Study Tool",
      quote:
        "Finally, a platform that understands how medical students actually learn. Highly recommended!",
      author: "Dr. Emily Rodriguez",
      role: "Medical Student",
      avatar: "/modules/avatar/alessandra.webp",
    },
  ];

  const blogPosts = [
    {
      title: "Latest In Endocrinology",
      description:
        "Quiz Rx is redefining how future healthcare professionals prepare, revise, and master complex medical topics - starting with endocrinology.",
      image: "/questions/endo.svg",
      category: "Endocrinology",
    },
    {
      title: "Better ways of exam preparation",
      description:
        "Discover innovative study strategies that help medical students excel in their exams through active learning and spaced repetition.",
      image: "/questions/neuro.svg",
      category: "Study Tips",
    },
    {
      title: "Latest research findings in Thyroid Gland",
      description:
        "Stay updated with the latest research and clinical findings in thyroid gland disorders and treatments.",
      image: "/questions/endo.svg",
      category: "Research",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-16 bg-[#EFF1FACC] rounded-3xl">
          {/* Two Column Layout */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
          >
            {/* Left Column - Title */}
            <motion.div variants={zoomUpAnimation}>
              <h1 className="text-3xl md:text-4xl text-gray-900 leading-tight">
                Empowering Medical Mastery, One Quiz at a Time
              </h1>
            </motion.div>

            {/* Right Column - Description */}
            <motion.div
              variants={zoomUpAnimation}
              className="flex items-center"
            >
              <p className="text-gray-600 leading-relaxed">
                Quiz Rx is redefining how future healthcare professionals
                prepare, revise, and master complex medical topics — starting
                with endocrinology.
              </p>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="relative w-full h-[550px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/about-us.png"
              alt="Medical professionals collaborating"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* About QuizRx Section */}
      <section className="py-20 bg-gray-50">
        <div
          className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 rounded-3xl overflow-hidden"
          style={{
            backgroundImage: "url('/background/blur.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="border border-white bg-white/20 rounded-3xl p-10 pb-0 mb-12">
            <motion.div
              initial="hidden"
              animate="show"
              variants={zoomInAnimation}
              className="mb-12"
            >
              <Badge
                variant="outline"
                className="mb-6 bg-white text-gray-600 border-gray-200 px-4 py-1 rounded-full"
              >
                About QuizRx
              </Badge>
              <h2 className="text-2xl md:text-4xl text-gray-900 mb-8 max-w-4xl">
                Quiz Rx began with a simple goal: to make medical learning more
                engaging, effective, and accessible.
              </h2>

              {/* Description Card */}
              <motion.div
                variants={zoomUpAnimation}
                className="bg-white rounded-3xl p-8 px-5 shadow-lg"
              >
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  As students ourselves, we struggled to find platforms that
                  merged real medical depth with active learning. Traditional
                  PDFs and passive content weren't enough. So we built Quiz Rx —
                  a platform focused on interactive learning through smart
                  quizzes and modular medical topics.
                  <br />
                  <br />
                  Starting with endocrinology, our platform is rapidly expanding
                  into other specialties, supporting learners from pre-clinical
                  years to board prep.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Metrics */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerUpAnimation}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                variants={staggerUpAnimation}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20"
              >
                <div className="text-4xl md:text-5xl text-gray-900 mb-4">
                  {metric.number}
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Discover What Sets Us Apart Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/30 to-purple-50/20">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-[#EFF1FACC] rounded-3xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-6 bg-white text-gray-600 border-white px-4 py-1 rounded-full"
            >
              The Difference
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900">
              Discover What Sets Us Apart
            </h2>
          </motion.div>

          {/* Grid Layout with centered image */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Column - First 2 features */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerUpAnimation}
              className="space-y-8"
            >
              {features.slice(0, 2).map((feature, index) => {
                // Split description to highlight the first two words in blue
                const words = feature.description.split(" ");
                const titleText = words.slice(0, 2).join(" ");
                const restText = " " + words.slice(2).join(" ");

                return (
                  <motion.div
                    key={index}
                    variants={staggerUpAnimation}
                    className="bg-white rounded-3xl p-6"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white text-2xl">
                        {feature.icon}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <span className="text-blue-600">{titleText}</span>
                      {restText}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Center Column - Image */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={zoomInAnimation}
              className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/woman-laptop.png"
                alt="Medical student learning"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Right Column - Last 2 features */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerUpAnimation}
              className="space-y-8"
            >
              {features.slice(2, 4).map((feature, index) => {
                // Split description to highlight the first two words in blue
                const words = feature.description.split(" ");
                const titleText = words.slice(0, 2).join(" ");
                const restText = " " + words.slice(2).join(" ");

                return (
                  <motion.div
                    key={index + 2}
                    variants={staggerUpAnimation}
                    className="bg-white rounded-3xl p-6"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white text-2xl">
                        {feature.icon}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <span className="text-blue-600">{titleText}</span>
                      {restText}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Experts Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-4 bg-white text-gray-600 border-gray-200"
            >
              Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Meet the experts behind QuizRx
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerUpAnimation}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={staggerUpAnimation}
                className="text-center"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{member.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-4 bg-white text-gray-600 border-gray-200"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerUpAnimation}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={staggerUpAnimation}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="font-bold text-gray-900 mb-4">
                  {testimonial.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Arrow */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="rounded-full p-3">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={zoomInAnimation}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-4 bg-white text-gray-600 border-gray-200"
            >
              Blog
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Discover The Latest Blogs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest in medical education, study
              strategies and platform insights
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerUpAnimation}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                variants={staggerUpAnimation}
                className="bg-white rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">📚</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Free Trial CTA Section */}
      <section className="py-20">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center rounded-3xl overflow-hidden py-20"
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
          >
            <Badge
              variant="outline"
              className="mb-4 bg-white text-gray-600 border-gray-200"
            >
              Free Trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">
              Try it out with our 3 days free trial
            </h2>
            <p className="text-gray-600 mb-8">No credit card required</p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white"
              />
              <Button
                onClick={() => push("/auth/signup")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                Try Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
