"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { Input } from "@/core/components/ui/input";

const DeleteAccountFrom = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  handleDeleteAccount,
  isDeleting,
  deleteConfirmationText,
  setDeleteConfirmationText,
}: {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  deleteConfirmationText: string;
  setDeleteConfirmationText: (text: string) => void;
}) => {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">
                To confirm, type{" "}
                <span className="font-bold">"delete my account"</span> below:
              </div>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="mt-2"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={
              deleteConfirmationText.toLowerCase() !== "delete my account" ||
              isDeleting
            }
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountFrom;
