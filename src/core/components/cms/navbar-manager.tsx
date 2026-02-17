"use client";

import { useState } from 'react';
import {
  useAllNavItems,
  useCreateNavItem,
  useDeleteNavItem,
  useReorderNavItems,
} from '@/modules/cms/hooks/use-cms';
import { NavItem } from '@/modules/cms/apollo/types';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/ui/alert-dialog';
import { useToast } from '@/core/hooks/use-toast';

interface NavbarManagerProps {
  refreshTrigger?: number;
}

export function NavbarManager({ refreshTrigger }: NavbarManagerProps) {
  const { data, loading, refetch } = useAllNavItems();
  const { createNavItem } = useCreateNavItem();
  const { deleteNavItem } = useDeleteNavItem();
  const { reorderNavItems } = useReorderNavItems();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', href: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const links = data?.getAllNavItems || [];

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.href) return;
    
    try {
      await createNavItem({
        name: newLink.name,
        href: newLink.href,
        order: links.length,
        isVisible: true,
      });
      
      setNewLink({ name: '', href: '' });
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Navigation link added successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add navigation link',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setLinkToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    
    try {
      await deleteNavItem(linkToDelete.id);
      toast({
        title: 'Success',
        description: 'Navigation link deleted successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete navigation link',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]];
    try {
      await reorderNavItems(newLinks.map(l => l._id));
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder navigation links',
        variant: 'destructive',
      });
    }
  };

  const moveDown = async (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    try {
      await reorderNavItems(newLinks.map(l => l._id));
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder navigation links',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Navbar Links</h2>
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading navigation links...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Navigation Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{linkToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Navbar Links</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Navbar Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-name">Link Name</Label>
                <Input
                  id="link-name"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="e.g., About Us"
                />
              </div>
              <div>
                <Label htmlFor="link-href">URL</Label>
                <Input
                  id="link-href"
                  value={newLink.href}
                  onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
                  placeholder="e.g., /about-us"
                />
              </div>
              <Button onClick={handleAddLink} className="w-full">
                Add Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No navbar links yet
                </TableCell>
              </TableRow>
            ) : (
              links.map((link, index) => (
                <TableRow key={link._id}>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveDown(index)}
                        disabled={index === links.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>{link.href}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(link._id, link.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </>
  );
}
