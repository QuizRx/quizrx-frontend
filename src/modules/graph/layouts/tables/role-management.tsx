"use client";

import { DataTable } from "@/core/components/table/data-table";
import { useToast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ALL_USERS } from "../../apollo/query/user";
import { userColumns } from "../../components/columns/user";
import { User } from "../../types/api/user";

export const RoleManagementTable = () => {
  const { toast } = useToast();
  const [userData, setUsersData] = useState<User[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getAllUsers?.data) {
      setUsersData(data.getAllUsers.data);
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
      <DataTable columns={userColumns} data={userData} isLoading={loading} />
    </div>
  );
};
