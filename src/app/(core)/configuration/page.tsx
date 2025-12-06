"use client";

import PageTitle from "@/core/components/shared/page-title";
import { Neo4jConfigTable } from "@/modules/graph/layouts/tables/neo4j";
import { PineconeConfigTable } from "@/modules/graph/layouts/tables/pinecone";
import { Settings, Upload, Cpu, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { push } = useRouter();
  const cards = [
    {
      id: "pinecone",
      title: "Set up Pinecone",
      icon: <Settings size={14} className="text-primary-foreground" />,
      path: "/configuration/pinecone",
    },
    {
      id: "neo4j",
      title: "Set up Neo4j",
      icon: <Settings size={14} className="text-primary-foreground" />,
      path: "/configuration/neo4j",
    },
    {
      id: "files",
      title: "Upload & manage Files",
      icon: <Upload size={14} className="text-primary-foreground" />,
      path: "/configuration/file-management",
    },
    {
      id: "integration",
      title: "Model Context Protocol",
      icon: <Database size={14} className="text-primary-foreground" />,
      path: "/configuration/",
    },
  ];
  return (
    <div className="mx-auto px-4 py-6">
      <div className="w-full">
        <PageTitle
          title={"Get Started"}
          description={"Get started by integrating your data."}
        />
        <div className="flex flex-row space-x-4">
          {/* {cards.map((card) => (
            <div
              key={card.id}
              className=" bg-white border border-zinc-200 hover:opacity-80 rounded-sm cursor-pointer min-w-[15rem] max-w-3xl"
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
          ))} */}
        </div>
      </div>
      <h1 className="text-lg mb-6 mt-10"></h1>

      {/* <PineconeConfigTable />
      <Neo4jConfigTable /> */}
    </div>
  );
}
