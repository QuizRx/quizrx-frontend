"use client";

import { DataTable } from "@/core/components/table/data-table";
import { TableTitleHeader } from "@/core/components/table/title-header";
import { toast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_USER_PINECONE_CONFIGS } from "../../apollo/query/pinecone";
import { pineconeConfigColumns } from "../../components/columns/pinecone-config";
import { PineconeConfig } from "../../types/api/pinecone";

export const PineconeConfigTable = () => {
  const [pineconeData, setPineconeData] = useState<PineconeConfig[]>([]);
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

  return (
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
  );
};
