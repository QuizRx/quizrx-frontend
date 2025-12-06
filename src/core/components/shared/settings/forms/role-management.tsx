"use client";

import { DataTable } from "@/core/components/table/data-table";
import { use, useEffect, useRef, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "@/core/components/ui/separator";
import { TabsContent } from "@/core/components/ui/tabs";
import PageTitle from "@/core/components/shared/page-title";
import { userColumns } from "@/modules/graph/components/columns/user";
import { User } from "@/modules/graph/types/api/user";
import { useQuery } from "@apollo/client";
import { GET_ALL_USERS } from "@/modules/graph/apollo/query/user";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useToast } from "@/core/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import UserForm from "@/modules/graph/layouts/forms/user";
import { DataTablePagination } from "@/core/components/table";

const RoleManagement = () => {
  const [userData, setUsersData] = useState<User[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
    variables: {
      pagination: {
        page:1,
        limit:50,
      },
    },
    fetchPolicy: "network-only",
  });

  console.log(data?.getAllUsers?.data);

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
    <TabsContent value="role-management">
      <div className="space-y-8 mb-12">
        <div className="my-8 flex justify-between">
          <div>
            <h2 className="text-xl font-medium">Role Management</h2>
            <p className="text-sm ">Manage user and administration roles</p>
          </div>
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite New Member
          </Button>
        </div>
        <div className="mt-8">
          <DataTable
            pagination
            columns={userColumns}
            data={userData}
            isLoading={loading}
            />
        </div>
      </div>

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <UserForm
            mode="invite"
            onSuccess={() => {
              refetch();
              setInviteModalOpen(false);
            }}
            onCancel={() => setInviteModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default RoleManagement;
