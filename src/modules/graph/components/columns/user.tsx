"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import { DELETE_PINECONE_CONFIG } from "@/modules/graph/apollo/mutation/pinecone";
import {
  REMOVE_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/modules/graph/apollo/mutation/user";
import { GET_USER_PINECONE_CONFIGS } from "@/modules/graph/apollo/query/pinecone";
import { GET_ALL_USERS } from "@/modules/graph/apollo/query/user";
import PineconeConfigForm from "@/modules/graph/layouts/forms/pinecone";
import UserForm from "@/modules/graph/layouts/forms/user";
import { UserRole, UserStatus } from "@/modules/graph/types/api/enum";
import { User } from "@/modules/graph/types/api/user";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical, Power, Trash } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";
import moment from "moment";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium flex gap-2">
          {row.original.firstName} {row.original.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left">Email</div>,
    cell: ({ row }) => {
      return <div className="text-left font-medium">{row.original.email}</div>;
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left">Role</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          <Badge
            variant={
              row.original.role === UserRole.OWNER
                ? "glow"
                : row.original.role === UserRole.EDITOR
                ? "default"
                : "secondary"
            }
          >
            {row.original.role}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Date Joined</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 text-left font-medium">
        {moment(row.original.createdAt).format("Do MMMM, YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 text-left font-medium">
          {row.original.status}
          {row.original.status === UserStatus.ACTIVE ? (
            <div className="w-2 h-2 my-auto z-50 bg-green-600 rounded-full flex flex-col items-center justify-center">
              <div className="h-2.5 w-2.5 bg-green-700 animate-ping rounded-full" />
            </div>
          ) : (
            <div className="w-2 h-2 my-auto z-50 bg-gray-300 rounded-full" />
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return <UserActions row={row} />;
    },
  },
];

const UserActions = ({ row }: { row: Row<User> }) => {
  const { toast } = useToast();
  const client = useApolloClient();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [removeUser, { loading: removeLoading }] =
    useMutation(REMOVE_USER_MUTATION);
  const [updateUserStatus, { loading: statusUpdateLoading }] =
    useMutation(UPDATE_USER_MUTATION);

  const handleDeleteUser = () => {
    removeUser({
      variables: {
        removeUserId: row.original._id,
      },
      onCompleted: () => {
        setConfirmDeleteOpen(false);
        toast({
          title: "Success",
          description: "User removed successfully",
        });
        client.refetchQueries({
          include: [GET_ALL_USERS],
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const handleToggleUserStatus = () => {
    const newStatus =
      row.original.status === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE;

    updateUserStatus({
      variables: {
        updateUserInput: {
          id: row.original._id,
          status: newStatus,
        },
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: `User ${
            newStatus === UserStatus.ACTIVE ? "activated" : "deactivated"
          } successfully`,
        });
        client.refetchQueries({
          include: [GET_ALL_USERS],
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setViewModalOpen(true)}>
            <Eye className="h-4 w-4 mr-2" color="blue" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" color="green" />
            Edit Role
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleUserStatus}
            disabled={statusUpdateLoading}
          >
            <Power className="h-4 w-4 mr-2" color="orange" />
            {row.original.status === UserStatus.ACTIVE
              ? "Deactivate"
              : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="h-4 w-4 mr-2" color="red" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View User Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <UserForm
            user={row.original}
            mode="view"
            onCancel={() => setViewModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <UserForm
            user={row.original}
            mode="edit"
            onSuccess={() => {
              client.refetchQueries({
                include: [GET_USER_PINECONE_CONFIGS],
              });
              setEditModalOpen(false);
            }}
            onCancel={() => setEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {row.original.firstName + " " + row.original.lastName}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={removeLoading}
              loading={removeLoading}
            >
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
