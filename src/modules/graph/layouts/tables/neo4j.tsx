"use client";

import { DataTable } from "@/core/components/table/data-table";
import { TableTitleHeader } from "@/core/components/table/title-header";
import { toast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { GET_USER_NEO4J_CONFIGS } from "@/modules/graph/apollo/query/neo4j";
import { neo4jConfigColumns } from "@/modules/graph/components/columns/neo4j-config";
import { Neo4jConfig } from "@/modules/graph/types/api/neo4j";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export const Neo4jConfigTable = () => {
  const [neo4jData, setNeo4jData] = useState<Neo4jConfig[]>([]);

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
  );
};
