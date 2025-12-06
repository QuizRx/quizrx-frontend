"use client";

import PageTitle from "@/core/components/shared/page-title";
import { Neo4jConfigTable } from "@/modules/graph/layouts/tables/neo4j";
import { PineconeConfigTable } from "@/modules/graph/layouts/tables/pinecone";
import { 
  Settings, 
  Upload, 
  Cpu, 
  Boxes, 
  Database, 
  Cloud, 
  Zap, 
  BarChart3, 
  Globe, 
  Network, 
  Server, 
  Layers,
  Search,
  GitBranch,
  Share2,
  FileText,
  Activity,
  BookOpen,
  Brain,
  FlaskConical,
  GraduationCap,
  Library,
  Monitor,
  Pill,
  Scan,
  Stethoscope,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { push } = useRouter();
  const cards = [
    {
      id: "pinecone",
      title: "Set up Pinecone",
      icon: <Settings size={14} className="text-primary-foreground" />,
      path: "/data-config/pinecone",
    },
    {
      id: "neo4j",
      title: "Set up Neo4j",
      icon: <Settings size={14} className="text-primary-foreground" />,
      path: "/data-config/neo4j",
    },
    {
      id: "files",
      title: "File Manager",
      icon: <Upload size={14} className="text-primary-foreground" />,
      path: "/data-config/file-management",
    },
    {
      id: "mcp",
      title: "Model Context Protocol",
      icon: <Boxes size={14} className="text-primary-foreground" />,
      path: "/data-config/",
    },
  ];

  const integrationTools = [
    {
      name: "PubMed",
      icon: <BookOpen size={24} className="text-blue-600" />,
      description: "Access 35M+ biomedical literature citations",
      category: "Research"
    },
    {
      name: "MEDLINE",
      icon: <Library size={24} className="text-green-600" />,
      description: "Premier bibliographic database of medical literature",
      category: "Research"
    },
    {
      name: "UpToDate",
      icon: <Stethoscope size={24} className="text-red-500" />,
      description: "Evidence-based clinical decision support",
      category: "Clinical"
    },
    {
      name: "SNOMED CT",
      icon: <Brain size={24} className="text-purple-600" />,
      description: "Comprehensive clinical terminology database",
      category: "Terminology"
    },
    {
      name: "ICD-10/11",
      icon: <FileText size={24} className="text-orange-600" />,
      description: "International classification of diseases",
      category: "Classification"
    },
    {
      name: "DrugBank",
      icon: <Pill size={24} className="text-pink-600" />,
      description: "Comprehensive drug and medication database",
      category: "Pharmacology"
    },
    {
      name: "DICOM Viewer",
      icon: <Scan size={24} className="text-indigo-600" />,
      description: "Medical imaging data integration",
      category: "Imaging"
    },
    {
      name: "ClinicalTrials.gov",
      icon: <FlaskConical size={24} className="text-teal-600" />,
      description: "Clinical research studies database",
      category: "Research"
    },
    {
      name: "Anatomage",
      icon: <Monitor size={24} className="text-gray-700" />,
      description: "3D anatomy visualization platform",
      category: "Education"
    },
    {
      name: "Lecturio",
      icon: <GraduationCap size={24} className="text-blue-500" />,
      description: "Medical education video platform",
      category: "Education"
    },
    {
      name: "Case Studies",
      icon: <Users size={24} className="text-green-500" />,
      description: "Interactive clinical case databases",
      category: "Clinical"
    },
    {
      name: "Vital Signs Monitor",
      icon: <Activity size={24} className="text-red-600" />,
      description: "Real-time patient monitoring data",
      category: "Clinical"
    }
  ];

  return (
    <div className="mx-auto px-4 py-6">
      <div className="w-full">
        <PageTitle
          title={"Get Started"}
          description={"Get started by integrating your data."}
        />
        <div className="flex flex-row space-x-4 w-3/4">
          {cards.map((card) => (
            <div
              key={card.id}
              className=" bg-white border border-zinc-200 hover:opacity-80 rounded-sm cursor-pointer min-w-[13rem] max-w-3xl"
              onClick={() => {
                push(card.path);
              }}
            >
              <div className="p-4 flex items-center gap-2">
                <div className="h-6 w-6 mr-4 bg-primary rounded-sm flex items-center justify-center">
                  {card.icon}
                </div>
                <span className="text-sm">{card.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <h1 className="text-lg mb-6 mt-10">Data Integration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4 w-3/4">
        {integrationTools.map((tool) => (
          <div
            key={tool.name}
            className="bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm rounded-lg p-4 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900">{tool.name}</h3>
                <p className="text-xs text-gray-500">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}