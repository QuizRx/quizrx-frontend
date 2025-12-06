"use client";

import { useQuery } from "@apollo/client";
import { GET_USER_NEO4J_CONFIGS } from "@/modules/graph/apollo/query/neo4j";
import { GET_USER_PINECONE_CONFIGS } from "@/modules/graph/apollo/query/pinecone";
import { neo4jConfigColumns } from "@/modules/graph/components/columns/neo4j-config";
import { pineconeConfigColumns } from "@/modules/graph/components/columns/pinecone-config";
import { Neo4jConfig } from "@/modules/graph/types/api/neo4j";
import { PineconeConfig } from "@/modules/graph/types/api/pinecone";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useEffect, useState } from "react";
import { DataTable } from "@/core/components/table/data-table";
import { TableTitleHeader } from "@/core/components/table/title-header";
import { TabsContent } from "@/core/components/ui/tabs";
import { useToast } from "@/core/hooks/use-toast";

const ApiManagementForm = () => {
  const { toast } = useToast();
  const [pineconeData, setPineconeData] = useState<PineconeConfig[]>([]);
  const [neo4jData, setNeo4jData] = useState<Neo4jConfig[]>([]);

  // Pinecone data query
  const {
    data: pineconeQueryData,
    loading: pineconeLoading,
    error: pineconeError,
  } = useQuery(GET_USER_PINECONE_CONFIGS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (pineconeQueryData?.getUserPineconeConfigs?.data) {
      setPineconeData(pineconeQueryData.getUserPineconeConfigs.data);
    }
    if (pineconeError) {
      const customError = extractCustomError(pineconeError);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [pineconeQueryData, pineconeError, toast]);

  // Neo4j data query
  const {
    data: neo4jQueryData,
    loading: neo4jLoading,
    error: neo4jError,
  } = useQuery(GET_USER_NEO4J_CONFIGS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (neo4jQueryData?.getUserNeo4jConfigs?.data) {
      setNeo4jData(neo4jQueryData.getUserNeo4jConfigs.data);
    }
    if (neo4jError) {
      const customError = extractCustomError(neo4jError);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [neo4jQueryData, neo4jError, toast]);

  return (
    <TabsContent value="api" className="mt-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium">API Management</h2>
          <p className="text-sm">Manage your API keys and integrations</p>
        </div>
      </div>
      <div className="mt-8">
        <DataTable
          columns={pineconeConfigColumns}
          data={pineconeData}
          isLoading={pineconeLoading}
          error={pineconeError?.message}
          header={
            <TableTitleHeader
              title="PineCone"
              description="List of Integrated Pinecone Config's."
              onSearchTextChange={() => {}}
              onFilterChange={() => {}}
            />
          }
        />
      </div>
      <div className="mt-8">
        <DataTable
          columns={neo4jConfigColumns}
          data={neo4jData}
          isLoading={neo4jLoading}
          error={neo4jError?.message}
          header={
            <TableTitleHeader
              title="Neo4j"
              description="List of Integrated Neo4j Config's."
              onSearchTextChange={() => {}}
              onFilterChange={() => {}}
            />
          }
        />
      </div>
    </TabsContent>
  );
};

export default ApiManagementForm;
