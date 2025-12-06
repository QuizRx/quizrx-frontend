"use client";

import { Separator } from "@/core/components/ui/separator";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, File } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_CURRICULUM_QUERY } from "@/modules/chat/apollo/query/curriculum";
import { Skeleton } from "@/core/components/ui/skeleton";
import { curriculumData } from "./mock-data";
import PageTitle from "@/core/layouts/common/page-title";

const ProgressBar = ({ completed, total, size = "default" }:any) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const height = size === "small" ? "h-1.5" : "h-2";
  
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-300 ease-out ${
          percentage === 100 ? 'bg-blue-500' : 
          percentage >= 75 ? 'bg-blue-500' : 
          percentage >= 50 ? 'bg-blue-500' : 
          percentage >= 25 ? 'bg-blue-500' : 'bg-blue-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
const alfabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export default function EndocrinologyCurriculum() {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_CURRICULUM_QUERY);
  // const data = {getCurriculum: curriculumData};
  // const loading = false; // Mock loading state for demonstration
  const toggleSection = (sectionId: any) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const filteredData = useMemo(() => {
    if (loading || !data) return [];

    switch (filter) {
      case "completed":
        return data.getCurriculum.filter(section => 
          section.completedSubtopics === section.totalSubtopics
        );
      case "in-progress":
        return data.getCurriculum.filter(section => 
          section.completedSubtopics > 0 && section.completedSubtopics < section.totalSubtopics
        );
      case "not-started":
        return data.getCurriculum.filter(section => section.completedSubtopics === 0);
      default:
        return data.getCurriculum;
    }
  }, [filter, data, loading]);

  const overallStats = useMemo(() => {
    if (loading || !data) return {
      totalSections: 0,
      completedSections: 0,
      totalSubtopics: 0,
      completedSubtopics: 0,
      totalHours: 0,
      completedHours: 0,
      overallProgress: 0
    };
    const totalSections = data.getCurriculum.length;
    const completedSections = data.getCurriculum.filter(s => s.completedSubtopics === s.totalSubtopics).length;
    const totalSubtopics = data.getCurriculum.reduce((sum, section) => sum + section.totalSubtopics, 0);
    const completedSubtopics = data.getCurriculum.reduce((sum, section) => sum + section.completedSubtopics, 0);
    const totalHours = data.getCurriculum.reduce((sum, section) => sum + section.totalQuestions, 0);
    const completedHours = data.getCurriculum.reduce((sum, section) => {
      const sectionCompletedHours = section.subtopics
        .filter(sub => sub.completed)
        .reduce((subSum, sub) => subSum + sub.totalQuestions, 0);
      return sum + sectionCompletedHours;
    }, 0);

    return {
      totalSections,
      completedSections,
      totalSubtopics,
      completedSubtopics,
      totalHours,
      completedHours,
      overallProgress: Math.round((completedSubtopics / totalSubtopics) * 100)
    };
  }, [data, loading]);
  
  if (loading) {
    return (
      <div className="mx-auto px-6 py-8 min-h-screen">
        <PageTitle
        title="Curriculum"
        description="Browse our curriculum and track your progression."
        />
        <Separator />
        <div className="flex flex-wrap gap-2 mb-6 mt-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-32 h-8 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-8 bg-transparent from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <PageTitle
        title="Curriculum"
        description="Browse our curriculum and track your progression."
        />

      <Separator />
  
      {/* Filter Buttons */}
      {data && (
        <div className="flex flex-wrap gap-2 mb-6 mt-6">
          {[
            { key: "all", label: "All Sections", count: data.getCurriculum.length },
            { key: "completed", label: "Completed", count: data.getCurriculum.filter(s => s.completedSubtopics === s.totalSubtopics).length },
            { key: "in-progress", label: "In Progress", count: data.getCurriculum.filter(s => s.completedSubtopics > 0 && s.completedSubtopics < s.totalSubtopics).length },
            { key: "not-started", label: "Not Started", count: data.getCurriculum.filter(s => s.completedSubtopics === 0).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-small text-sm transition-all duration-200 ${
                filter === key
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Curriculum Sections */}
      {data && (
        <div className="space-y-2">
          {filteredData.map((section, indexSection) => {
            // Use indexSection and section.title to create a unique id
            const sectionId = `${indexSection}-${section.title}`;
            const isExpanded = expandedSections.has(sectionId);
            const progressPercentage = Math.round((section.completedSubtopics / section.totalSubtopics) * 100);
            
            return (
              <div key={sectionId} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                {/* Section Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleSection(sectionId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-md font-normal text-gray-900 mb-2">
                          <span className="font-bold">{section.id ? section.id + ". ": ""} </span>
                          {section.title}
                          </h3>
                        <div className="flex items-center gap-6">
                          <div className="flex-1 max-w-xs">
                            <ProgressBar completed={section.completedSubtopics} total={section.totalSubtopics} />
                          </div>
                          <div className="text-sm text-gray-600">
                            {section.completedSubtopics}/{section.totalSubtopics} topics
                          </div>
                          <div className="text-sm text-gray-600">
                            {section.totalQuestions} questions total
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-md font-semibold text-gray-900">{progressPercentage}%</div>
                        <div className="text-sm text-gray-500">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtopics */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                      <div className="grid gap-3">
                        {section.subtopics.map((subtopic, subIndex) => {
                          // Use subIndex and subtopic.title for unique subtopic id
                          const subtopicId = `${subIndex}-${subtopic.title}`;
                          return (
                            <div
                              key={subtopicId}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                                subtopic.completed
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  subtopic.completed
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}>
                                  {subtopic.completed ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">{subtopic.id? subtopic.id+ ". " : ""}</span>
                                  <span className="ml-2 text-gray-700">{subtopic.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <File className="h-4 w-4" />
                                  <span>{subtopic.totalQuestions} questions</span>
                                </div>
                                {subtopic.completed && (
                                  <div className="text-green-600 text-sm font-medium">
                                    ✓ Completed
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Section Summary */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Section Summary</h4>
                            <p className="text-blue-700 text-sm">
                              Progress: {section.completedSubtopics} of {section.totalSubtopics} topics completed
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-900 font-semibold">
                              {section.subtopics.filter(s => s.completed).reduce((sum, s) => sum + s.totalQuestions, 0)} / {section.totalQuestions} questions
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-white rounded-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Continue Learning?</h3>
          <p className="text-gray-600 mb-6">
            You've completed {overallStats.completedSubtopics} out of {overallStats.totalSubtopics} topics. 
            Keep up the great work!
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer" onClick={() => router.push("/dashboard")}>
              Continue
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer" onClick={() => {setFilter("all"); toggleSection("");}}>
              Review Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
