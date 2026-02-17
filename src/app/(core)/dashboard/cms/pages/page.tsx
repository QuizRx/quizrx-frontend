"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageManagement() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new CMS dashboard
    router.push('/cms-dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to CMS Dashboard...</p>
    </div>
  );
}
    content: '',
    published: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const allPages = await getAllPages();
      setPages(allPages.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Failed to load pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await updatePage(editingPage.id, formData);
        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        await createPage(formData);
        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }
      await loadPages();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      published: page.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await deletePage(id);
      await loadPages();
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      await updatePage(page.id, { published: !page.published });
      await loadPages();
      toast({
        title: 'Success',
        description: `Page ${page.published ? 'unpublished' : 'published'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update page status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      published: false,
    });
    setEditingPage(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Page Management</h2>
          <p className="text-muted-foreground">Create and manage your website pages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>
                {editingPage ? 'Update your page content' : 'Add a new page to your website'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingPage ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Page Title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="page-slug"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    URL will be: /page/{formData.slug}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <TiptapEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPage ? 'Update' : 'Create'} Page
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription>/page/{page.slug}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {page.published ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-sm text-muted-foreground line-clamp-3 mb-4"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              <div className="text-xs text-muted-foreground mb-4">
                Updated: {new Date(page.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(page)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePublish(page)}
                >
                  {page.published ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(page.id)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No pages yet. Create your first page!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
