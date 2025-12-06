"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/core/components/ui/breadcrumb";
import { Skeleton } from "@/core/components/ui/skeleton";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const NavBreadCrumbs = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    // Only run on the client side
    setIsClient(true);
    if (pathname) {
      setSegments(pathname.split("/").filter(Boolean));
    }
  }, [pathname]);

  const capitalizeWordsAndRemoveSlashes = (str: string) => {
    return str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Show shadcn skeleton components until client-side rendering takes place
  if (!isClient) {
    return (
      <div className="hidden md:flex items-center space-x-2 h-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem className="hidden md:block">
                {isLast ? (
                  <BreadcrumbPage className="text-primary text-sm max-lg:text-xs">
                    {capitalizeWordsAndRemoveSlashes(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={href}
                    className="text-gray-600 text-md max-lg:text-xs hover:text-primary"
                  >
                    {capitalizeWordsAndRemoveSlashes(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NavBreadCrumbs;
