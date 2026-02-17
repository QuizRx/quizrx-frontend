"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Switch } from '@/core/components/ui/switch';
import { useToast } from '@/core/hooks/use-toast';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { 
  usePageById, 
  useCreatePage, 
  useUpdatePage,
  useCreateNavItem,
  useAllNavItems 
} from '@/modules/cms/hooks/use-cms';
import { CMSPage } from '@/modules/cms/apollo/types';

interface PageEditorProps {
  pageId?: string;
  onSaved?: () => void;
}

export function PageEditor({ pageId, onSaved }: PageEditorProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: pageData } = usePageById(pageId || '');
  const { createPage, loading: creating } = useCreatePage();
  const { updatePage, loading: updating } = useUpdatePage();
  const { createNavItem } = useCreateNavItem();
  const { data: navData } = useAllNavItems();

  const page = pageData?.getPageById;

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setPublished(page.isPublished);
      setMetaTitle(page.metaTitle || '');
      setMetaDescription(page.metaDescription || '');
    } else if (!pageId) {
      setTitle('');
      setSlug('');
      setPublished(true);
      setMetaTitle('');
      setMetaDescription('');
    }
  }, [page, pageId]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: '<p>Start writing your content...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when page changes
  useEffect(() => {
    if (editor && page?.content) {
      editor.commands.setContent(page.content);
    } else if (editor && !pageId) {
      editor.commands.setContent('<p>Start writing your content...</p>');
    }
  }, [editor, page, pageId]);

  useEffect(() => {
    if (title && !page) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  }, [title, page]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageByUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleSave = async () => {
    if (!editor || !title || !slug) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in title and slug",
      });
      return;
    }

    try {
      const isNewPage = !pageId;
      const pageInput = {
        title,
        slug,
        content: editor.getHTML(),
        isPublished: published,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };

      if (isNewPage) {
        await createPage(pageInput);
        
        // Create navbar link for new published pages
        if (published) {
          const existingLinks = navData?.getAllNavItems || [];
          const linkExists = existingLinks.some(link => link.href === `/${slug}`);
          
          if (!linkExists) {
            await createNavItem({
              name: title,
              href: `/${slug}`,
              order: existingLinks.length,
              isVisible: true,
            });
          }
        }
      } else {
        await updatePage(pageId, pageInput);
      }
      
      toast({
        title: "✅ Saved!",
        description: `Page "${title}" has been saved successfully.`,
      });
      
      if (onSaved) {
        onSaved();
      }
      
      // Reset form if it's a new page
      if (isNewPage) {
        setTitle('');
        setSlug('');
        setPublished(true);
        setMetaTitle('');
        setMetaDescription('');
        editor.commands.setContent('<p>Start writing your content...</p>');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to save page",
      });
    }
  };

  const handleCancel = () => {
    if (onSaved) {
      onSaved();
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter page title"
          />
        </div>

        <div>
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="page-url-slug"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Page will be accessible at: /{slug}
          </p>
        </div>

        <div>
          <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="SEO-optimized title"
          />
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Input
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief description for search engines"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-muted' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImageByUrl}
            title="Add image from URL"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="ml-1 text-xs">URL</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div className="w-px h-6 bg-border" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSave}>Save Page</Button>
        {pageId && (
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        )}
      </div>
    </div>
  );
}
