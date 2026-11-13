import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  isVisible: boolean;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  metaDescription?: string;
}

interface CMSDatabase extends DBSchema {
  navItems: {
    key: string;
    value: NavItem;
    indexes: { 'by-order': number };
  };
  pages: {
    key: string;
    value: Page;
    indexes: { 'by-slug': string };
  };
}

const DB_NAME = 'quizrx-cms';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<CMSDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase<CMSDatabase>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CMSDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create navItems store
      if (!db.objectStoreNames.contains('navItems')) {
        const navStore = db.createObjectStore('navItems', { keyPath: 'id' });
        navStore.createIndex('by-order', 'order');
      }

      // Create pages store
      if (!db.objectStoreNames.contains('pages')) {
        const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
        pageStore.createIndex('by-slug', 'slug', { unique: true });
      }
    },
  });

  return dbInstance;
}

// Nav Items CRUD
export async function getAllNavItems(): Promise<NavItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex('navItems', 'by-order');
  return items.filter(item => item.isVisible);
}

export async function getAllNavItemsForManagement(): Promise<NavItem[]> {
  const db = await getDB();
  return await db.getAllFromIndex('navItems', 'by-order');
}

export async function addNavItem(item: Omit<NavItem, 'id'>): Promise<string> {
  const db = await getDB();
  const id = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.add('navItems', { ...item, id });
  return id;
}

export async function updateNavItem(id: string, item: Partial<NavItem>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('navItems', id);
  if (existing) {
    await db.put('navItems', { ...existing, ...item });
  }
}

export async function deleteNavItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('navItems', id);
}

// Pages CRUD
export async function getAllPages(): Promise<Page[]> {
  const db = await getDB();
  return await db.getAll('pages');
}

export async function getPublishedPages(): Promise<Page[]> {
  const db = await getDB();
  const pages = await db.getAll('pages');
  return pages.filter(page => page.isPublished);
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const db = await getDB();
  return await db.getFromIndex('pages', 'by-slug', slug);
}

export async function getPageById(id: string): Promise<Page | undefined> {
  const db = await getDB();
  return await db.get('pages', id);
}

export async function createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await db.add('pages', {
    ...page,
    id,
    createdAt: now,
    updatedAt: now,
  });
  
  return id;
}

export async function updatePage(id: string, page: Partial<Page>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('pages', id);
  
  if (existing) {
    await db.put('pages', {
      ...existing,
      ...page,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deletePage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pages', id);
}

// Initialize with default data
export async function initializeDefaultData(): Promise<void> {
  const db = await getDB();
  
  // Check if we already have data
  const existingNavItems = await db.count('navItems');
  const existingPages = await db.count('pages');
  
  if (existingNavItems === 0) {
    // Add default nav items
    const defaultNavItems: Omit<NavItem, 'id'>[] = [
      { name: 'Home', href: '/', order: 1, isVisible: true },
      { name: 'About Us', href: '/about-us', order: 2, isVisible: true },
      { name: 'Pricing', href: '/pricing', order: 3, isVisible: true },
      { name: 'Feedback', href: '/feedback', order: 4, isVisible: true },
    ];
    
    for (const item of defaultNavItems) {
      await addNavItem(item);
    }
  }
  
  if (existingPages === 0) {
    // Add default pages
    const defaultPages: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        slug: 'about-us',
        title: 'About Us',
        content: '<h1>About Us</h1><p>Welcome to our platform!</p>',
        isPublished: true,
        metaDescription: 'Learn more about us',
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>',
        isPublished: true,
        metaDescription: 'Our privacy policy',
      },
      {
        slug: 'terms-conditions',
        title: 'Terms and Conditions',
        content: '<h1>Terms and Conditions</h1><p>Please read these terms carefully.</p>',
        isPublished: true,
        metaDescription: 'Terms and conditions',
      },
    ];
    
    for (const page of defaultPages) {
      await createPage(page);
    }
  }
}
