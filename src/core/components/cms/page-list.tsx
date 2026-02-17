"use client";

import { useState } from 'react';
import { useAllPages, useDeletePage, useAllNavItems, useDeleteNavItem } from '@/modules/cms/hooks/use-cms';
import { CMSPage } from '@/modules/cms/apollo/types';
import { Button } from '@/core/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import { Badge } from '@/core/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/core/hooks/use-toast';
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

interface PageListProps {
  onEdit: (page: CMSPage) => void;
  refreshTrigger?: number;
}

export function PageList({ onEdit, refreshTrigger }: PageListProps) {
  const { data, loading, refetch } = useAllPages();
  const { deletePage } = useDeletePage();
  const { data: navData, refetch: refetchNav } = useAllNavItems();
  const { deleteNavItem } = useDeleteNavItem();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string; slug: string } | null>(null);

  const pages = data?.getAllPages || [];
  const navItems = navData?.getAllNavItems || [];
  const sortedPages = [...pages].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleDeleteClick = (id: string, title: string, slug: string) => {
    setPageToDelete({ id, title, slug });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pageToDelete) return;
    
    try {
      // Delete the page
      await deletePage(pageToDelete.id);
      
      // Find and delete any navbar items that link to this page
      const pageUrl = `/${pageToDelete.slug}`;
      const relatedNavItems = navItems.filter(item => item.href === pageUrl);
      
      // Delete all related navbar items
      await Promise.all(
        relatedNavItems.map(item => deleteNavItem(item._id))
      );
      
      toast({
        title: 'Success',
        description: relatedNavItems.length > 0 
          ? `Page and ${relatedNavItems.length} related navbar link(s) deleted successfully`
          : 'Page deleted successfully',
      });
      
      refetch();
      refetchNav();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Pages</h2>
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? 
              {pageToDelete && navItems.filter(item => item.href === `/${pageToDelete.slug}`).length > 0 && (
                <span className="block mt-2 font-semibold text-orange-600 dark:text-orange-400">
                  This will also remove {navItems.filter(item => item.href === `/${pageToDelete.slug}`).length} related navbar link(s).
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
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
        <h2 className="text-2xl font-bold">All Pages</h2>
        <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No pages created yet
                </TableCell>
              </TableRow>
            ) : (
              sortedPages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/${page.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(page._id, page.title, page.slug)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
