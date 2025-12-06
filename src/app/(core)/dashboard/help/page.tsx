"use client";

import PageTitle from "@/core/components/shared/page-title";
import { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("Getting Started");

  const supportSections = [
    {
      title: "Getting Started",
      icon: "🚀",
      items: [
        {
          question: "How do I create my first quiz?",
          answer: "Navigate to the quiz creation page and follow the step-by-step wizard to generate your first quiz."
        },
        {
          question: "What types of questions can I create?",
          answer: "You can create multiple choice, true/false, short answer, and essay questions."
        },
        {
          question: "How do I access my quiz history?",
          answer: "Visit the Quiz History page to view all your previously created quizzes and their results."
        }
      ]
    },
    {
      title: "Account & Settings",
      icon: "⚙️",
      items: [
        {
          question: "How do I update my profile?",
          answer: "Go to Settings > Profile to update your personal information and preferences."
        },
        {
          question: "Can I change my password?",
          answer: "Yes, you can update your password in the Security section of your account settings."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. This action cannot be undone."
        }
      ]
    },
    {
      title: "Troubleshooting",
      icon: "🔧",
      items: [
        {
          question: "Why aren't my quizzes saving?",
          answer: "Check your internet connection and ensure you're logged in. Try refreshing the page and attempting again."
        },
        {
          question: "I'm experiencing slow loading times",
          answer: "Clear your browser cache and cookies. If the issue persists, try using a different browser."
        },
        {
          question: "Error messages when creating quizzes",
          answer: "Ensure all required fields are filled out correctly. Contact support if errors continue."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email",
      contact: "support@example.com",
      responseTime: "24-48 hours"
    },
    {
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 9 AM - 5 PM EST",
      responseTime: "Immediate"
    },
    {
      title: "Help Center",
      description: "Browse our knowledge base",
      contact: "help.example.com",
      responseTime: "Self-service"
    }
  ];

  return (
    <div className="mx-auto bg-transparent p-4 flex flex-col min-h-[90vh] max-w-4xl">
      <PageTitle
        title="Help & Support"
        description="Find answers to common questions and get the help you need."
      />

      {/* FAQ Sections */}
      <div className="grid gap-6 mb-8">
        {supportSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-transparent to-indigo-50 rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-2">{method.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{method.description}</p>
              <p className="text-sm font-medium text-blue-600 mb-1">{method.contact}</p>
              <p className="text-xs text-gray-500">{method.responseTime}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Quick Links</p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-blue-600 hover:text-blue-800">Status Page</a>
        </div>
      </div>
    </div>
  );
}