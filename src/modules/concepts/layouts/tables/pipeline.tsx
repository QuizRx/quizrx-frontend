"use client";

import { DataTable } from "@/core/components/table/data-table";
import { useToast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_USER_PIPELINES_QUERY } from "../../apollo/query/pipeline";
import { Pipeline } from "../../types/api/pipeline";
import { pipelineColumns } from "../../components/columns/pipeline";

export const PipelineTable = () => {
  const { toast } = useToast();
  const [pipelineData, setPipelineData] = useState<Pipeline[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_USER_PIPELINES_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getUserPipelines?.data) {
      setPipelineData(data.getUserPipelines.data);
    }
    if (error) {
      const customError = extractCustomError(error);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [data, error, toast]);

  return (
    <div className="mt-8">
      <h1 className="text-xl font-semibold">My Concepts</h1>
      <p className="text-muted-foreground">
        Here are some helpful resources to get you started with concepts.
      </p>
      <DataTable
        columns={pipelineColumns}
        data={pipelineData}
        isLoading={loading}
      />
    </div>
  );
};
