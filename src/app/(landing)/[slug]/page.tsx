"use client";

import { useParams } from 'next/navigation';
import { usePageBySlug } from '@/modules/cms/hooks/use-cms';
import { motion } from 'motion/react';

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, loading, error } = usePageBySlug(slug, true);

  const page = data?.getPageBySlug;

  if (loading) {
    return (
      <div className="container mx-auto py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="container mx-auto py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or hasn't been published yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div 
          className="prose prose-lg max-w-none dark:prose-invert [&_img]:mx-auto [&_img[style*='text-align: left']]:ml-0 [&_img[style*='text-align: right']]:mr-0 [&_img[style*='text-align: center']]:mx-auto"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </motion.div>
    </div>
  );
}
