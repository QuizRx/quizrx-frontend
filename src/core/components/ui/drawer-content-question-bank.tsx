"use client";

import React, { useState } from "react";
import { Question } from "@/modules/chat/types/api/question";
import { GET_QUESTIONS_BY_QUESTION_BANK_ID_QUERY } from "@/modules/chat/apollo/query/question";
import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/core/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";

interface DrawerContentQuestionBankProps {
  data: any;
  onOpenChange: any;
}

const cardAnimation = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function DrawerContentQuestionBank({
  data,
  onOpenChange,
}: DrawerContentQuestionBankProps) {
  const questionBankId = data?.questionBankId;

  const { data: questionsData, loading: isLoadingQuestions } = useQuery(
    GET_QUESTIONS_BY_QUESTION_BANK_ID_QUERY,
    {
      variables: {
        questionBankId: questionBankId || "",
        pagination: {
          page: 1,
          limit: 50
        }
      },
      skip: !questionBankId
    }
  );

  const questions = questionsData?.getQuestionsByQuestionBankId?.data || [];

  return (
    <div className="px-6 space-y-6">
      {/* Question Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{data?.name}</span>
            <Badge variant="secondary">{questions.length} Questions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Sub Topics:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {data?.sub_topics?.map((subtopic: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subtopic}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Total Questions:</span>
              <span className="ml-2">{data?.totalQuestions}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Questions List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Questions</h3>
        {isLoadingQuestions ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question: any, index: number) => (
              <Card key={question._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {question.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{question.question}</p>
                  <div className="text-xs text-gray-500">
                    <span>Topic: {question.topic}</span>
                    {question.sub_topic && (
                      <span className="ml-2">• Subtopic: {question.sub_topic}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No questions found for this question bank.
          </div>
        )}
      </div>
    </div>
  );
}
