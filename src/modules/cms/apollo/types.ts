// CMS Types
export interface CMSPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  _id: string;
  name: string;
  href: string;
  order: number;
  isVisible: boolean;
  subMenus?: SubMenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubMenuItem {
  name: string;
  href: string;
}

// Input Types
export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CreateNavItemInput {
  name: string;
  href: string;
  order: number;
  isVisible?: boolean;
  subMenus?: SubMenuItem[];
}

export interface UpdateNavItemInput {
  name?: string;
  href?: string;
  order?: number;
  isVisible?: boolean;
  subMenus?: SubMenuItem[];
}

export interface PageFilterInput {
  isPublished?: boolean;
  search?: string;
}

export interface ReorderNavItemsInput {
  itemIds: string[];
}
