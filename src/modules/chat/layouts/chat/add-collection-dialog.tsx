import { Button } from '@/core/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';

export default function AddCollectionDialog({
  isDialogOpen,
  setIsDialogOpen,
  onSubmit,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (v: boolean) => void;
  onSubmit: Function;
}) {
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collection</DialogTitle>
            <DialogDescription>Are you sure you want to log out? You will be redirected to the home page.</DialogDescription>
          </DialogHeader>
          oihoi
          <DialogFooter>
            <Button onClick={() => onSubmit()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
