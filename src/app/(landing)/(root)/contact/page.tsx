"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import { zoomInAnimation, staggerUpAnimation } from "@/core/utils/animations/motion";
import { Instagram, Youtube, Twitter, Linkedin } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "X (Twitter)" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={zoomInAnimation}
        className="w-full max-w-6xl"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Section - Contact Information */}
            <motion.div
              variants={staggerUpAnimation}
              className="bg-gray-50 p-8 lg:p-12 flex flex-col justify-center"
            >
              <motion.h1
                variants={staggerUpAnimation}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8"
              >
                Get in touch
              </motion.h1>

              <motion.div
                variants={staggerUpAnimation}
                className="space-y-6"
              >
                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Email
                  </Label>
                  <p className="text-gray-900 text-lg mt-1">
                    adminquizrx@gmail.com
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Phone
                  </Label>
                  <p className="text-gray-900 text-lg mt-1">
                    (123) 1221 2323
                  </p>
                </div>

                {/* Address */}
                <div>
                  <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </Label>
                  <p className="text-gray-900 text-lg mt-1 leading-relaxed">
                    123 Innovation Avenue, Suite 456<br />
                    Tech District<br />
                    San Francisco, CA 94107<br />
                    United States
                  </p>
                </div>

                {/* Social Media */}
                <div className="pt-4">
                  <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                    Follow Us
                  </Label>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        variants={staggerUpAnimation}
                        href={social.href}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5 text-gray-700" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Section - Contact Form */}
            <motion.div
              variants={staggerUpAnimation}
              className="p-8 lg:p-12 flex flex-col justify-center"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    variants={staggerUpAnimation}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </motion.div>

                  <motion.div
                    variants={staggerUpAnimation}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </motion.div>
                </div>

                {/* Message */}
                <motion.div
                  variants={staggerUpAnimation}
                  className="space-y-2"
                >
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here......"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </motion.div>

                {/* Send Message Button */}
                <motion.div
                  variants={staggerUpAnimation}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition-colors duration-200"
                  >
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
