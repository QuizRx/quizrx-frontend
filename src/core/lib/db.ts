import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
}

export interface NavLink {
  id: string;
  name: string;
  href: string;
  order: number;
  subMenus?: {
    id: string;
    name: string;
    href: string;
  }[];
}

interface CMSDatabase extends DBSchema {
  pages: {
    key: string;
    value: Page;
    indexes: { 'by-slug': string };
  };
  navLinks: {
    key: string;
    value: NavLink;
    indexes: { 'by-order': number };
  };
}

let dbInstance: IDBPDatabase<CMSDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase<CMSDatabase>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<CMSDatabase>('cms-database', 1, {
    upgrade(db) {
      // Create pages store
      if (!db.objectStoreNames.contains('pages')) {
        const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
        pageStore.createIndex('by-slug', 'slug', { unique: true });
      }

      // Create navLinks store
      if (!db.objectStoreNames.contains('navLinks')) {
        const navStore = db.createObjectStore('navLinks', { keyPath: 'id' });
        navStore.createIndex('by-order', 'order');
      }
    },
  });

  return dbInstance;
}

// Page operations
export async function createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
  const db = await getDB();
  const newPage: Page = {
    ...page,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.add('pages', newPage);
  return newPage;
}

export async function updatePage(id: string, updates: Partial<Omit<Page, 'id' | 'createdAt'>>): Promise<Page> {
  const db = await getDB();
  const existing = await db.get('pages', id);
  if (!existing) {
    throw new Error('Page not found');
  }
  const updated: Page = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };
  await db.put('pages', updated);
  return updated;
}

export async function deletePage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pages', id);
}

export async function getPage(id: string): Promise<Page | undefined> {
  const db = await getDB();
  return db.get('pages', id);
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const db = await getDB();
  return db.getFromIndex('pages', 'by-slug', slug);
}

export async function getAllPages(): Promise<Page[]> {
  const db = await getDB();
  return db.getAll('pages');
}

export async function getPublishedPages(): Promise<Page[]> {
  const db = await getDB();
  const allPages = await db.getAll('pages');
  return allPages.filter(page => page.published);
}

// NavLink operations
export async function createNavLink(link: Omit<NavLink, 'id'>): Promise<NavLink> {
  const db = await getDB();
  const newLink: NavLink = {
    ...link,
    id: crypto.randomUUID(),
  };
  await db.add('navLinks', newLink);
  return newLink;
}

export async function updateNavLink(id: string, updates: Partial<Omit<NavLink, 'id'>>): Promise<NavLink> {
  const db = await getDB();
  const existing = await db.get('navLinks', id);
  if (!existing) {
    throw new Error('NavLink not found');
  }
  const updated: NavLink = {
    ...existing,
    ...updates,
  };
  await db.put('navLinks', updated);
  return updated;
}

export async function deleteNavLink(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('navLinks', id);
}

export async function getAllNavLinks(): Promise<NavLink[]> {
  const db = await getDB();
  const links = await db.getAllFromIndex('navLinks', 'by-order');
  return links;
}

export async function reorderNavLinks(linkIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('navLinks', 'readwrite');
  
  await Promise.all(
    linkIds.map(async (id, index) => {
      const link = await tx.store.get(id);
      if (link) {
        link.order = index;
        await tx.store.put(link);
      }
    })
  );
  
  await tx.done;
}
