import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  published: boolean;
}

export interface NavbarLink {
  id: string;
  name: string;
  href: string;
  order: number;
  subMenus?: {
    name: string;
    href: string;
  }[];
}

interface CMSDatabase extends DBSchema {
  pages: {
    key: string;
    value: CMSPage;
    indexes: { 'by-slug': string };
  };
  navbarLinks: {
    key: string;
    value: NavbarLink;
    indexes: { 'by-order': number };
  };
}

const DB_NAME = 'quizrx-cms';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<CMSDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase<CMSDatabase>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CMSDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create pages store
      if (!db.objectStoreNames.contains('pages')) {
        const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
        pageStore.createIndex('by-slug', 'slug', { unique: true });
      }

      // Create navbar links store
      if (!db.objectStoreNames.contains('navbarLinks')) {
        const navStore = db.createObjectStore('navbarLinks', { keyPath: 'id' });
        navStore.createIndex('by-order', 'order');
      }
    },
  });

  return dbInstance;
}

// Page Management
export async function createPage(page: Omit<CMSPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSPage> {
  const db = await getDB();
  const newPage: CMSPage = {
    ...page,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.add('pages', newPage);
  return newPage;
}

export async function updatePage(id: string, updates: Partial<CMSPage>): Promise<void> {
  const db = await getDB();
  const page = await db.get('pages', id);
  if (!page) throw new Error('Page not found');
  
  const updatedPage: CMSPage = {
    ...page,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await db.put('pages', updatedPage);
}

export async function deletePage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pages', id);
}

export async function getPage(id: string): Promise<CMSPage | undefined> {
  const db = await getDB();
  return db.get('pages', id);
}

export async function getPageBySlug(slug: string): Promise<CMSPage | undefined> {
  const db = await getDB();
  return db.getFromIndex('pages', 'by-slug', slug);
}

export async function getAllPages(): Promise<CMSPage[]> {
  const db = await getDB();
  return db.getAll('pages');
}

export async function savePage(page: CMSPage): Promise<void> {
  const db = await getDB();
  const existingPage = await db.get('pages', page.id);
  
  const pageToSave: CMSPage = {
    ...page,
    createdAt: existingPage?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (existingPage) {
    // Update existing page
    await db.put('pages', pageToSave);
  } else {
    // Create new page
    await db.add('pages', pageToSave);
  }
}

// Navbar Link Management
export async function createNavbarLink(link: Omit<NavbarLink, 'id'>): Promise<NavbarLink> {
  const db = await getDB();
  const newLink: NavbarLink = {
    ...link,
    id: Date.now().toString(),
  };
  await db.add('navbarLinks', newLink);
  return newLink;
}

export async function updateNavbarLink(id: string, updates: Partial<NavbarLink>): Promise<void> {
  const db = await getDB();
  const link = await db.get('navbarLinks', id);
  if (!link) throw new Error('Navbar link not found');
  
  const updatedLink: NavbarLink = {
    ...link,
    ...updates,
  };
  await db.put('navbarLinks', updatedLink);
}

export async function deleteNavbarLink(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('navbarLinks', id);
}

export async function getAllNavbarLinks(): Promise<NavbarLink[]> {
  const db = await getDB();
  const links = await db.getAllFromIndex('navbarLinks', 'by-order');
  return links;
}

export async function reorderNavbarLinks(linkIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('navbarLinks', 'readwrite');
  
  for (let i = 0; i < linkIds.length; i++) {
    const link = await tx.store.get(linkIds[i]);
    if (link) {
      link.order = i;
      await tx.store.put(link);
    }
  }
  
  await tx.done;
}

// Initialize with default data
export async function initializeDefaultData(): Promise<void> {
  const db = await getDB();
  const existingLinks = await db.getAll('navbarLinks');
  
  if (existingLinks.length === 0) {
    // Create default navbar links
    const defaultLinks: Omit<NavbarLink, 'id'>[] = [
      { name: 'Home', href: '/', order: 0 },
      { name: 'About Us', href: '/about-us', order: 1 },
      { name: 'Pricing', href: '/pricing', order: 2 },
      { name: 'Contact', href: '/contact', order: 3 },
    ];

    for (const link of defaultLinks) {
      await createNavbarLink(link);
    }
  }
}
