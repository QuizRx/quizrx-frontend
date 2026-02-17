import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GET_ALL_PAGES,
  GET_PUBLISHED_PAGES,
  GET_PAGE_BY_SLUG,
  GET_PAGE_BY_ID,
  GET_ALL_NAV_ITEMS,
  GET_VISIBLE_NAV_ITEMS,
} from '../apollo/queries';
import {
  CREATE_PAGE,
  UPDATE_PAGE,
  DELETE_PAGE,
  TOGGLE_PAGE_PUBLISH_STATUS,
  CREATE_NAV_ITEM,
  UPDATE_NAV_ITEM,
  DELETE_NAV_ITEM,
  REORDER_NAV_ITEMS,
  TOGGLE_NAV_ITEM_VISIBILITY,
} from '../apollo/mutations';
import {
  CMSPage,
  NavItem,
  CreatePageInput,
  UpdatePageInput,
  CreateNavItemInput,
  UpdateNavItemInput,
  PageFilterInput,
  ReorderNavItemsInput,
} from '../apollo/types';

export class CMSService {
  constructor(private client: ApolloClient<NormalizedCacheObject>) {}

  // Page Operations
  async getAllPages(filter?: PageFilterInput): Promise<CMSPage[]> {
    const { data } = await this.client.query({
      query: GET_ALL_PAGES,
      variables: { filter },
      fetchPolicy: 'network-only',
    });
    return data.getAllPages;
  }

  async getPublishedPages(): Promise<CMSPage[]> {
    const { data } = await this.client.query({
      query: GET_PUBLISHED_PAGES,
      fetchPolicy: 'network-only',
    });
    return data.getPublishedPages;
  }

  async getPageBySlug(slug: string, onlyPublished = true): Promise<CMSPage | null> {
    try {
      const { data } = await this.client.query({
        query: GET_PAGE_BY_SLUG,
        variables: { slug, onlyPublished },
        fetchPolicy: 'network-only',
      });
      return data.getPageBySlug;
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      return null;
    }
  }

  async getPageById(id: string): Promise<CMSPage | null> {
    try {
      const { data } = await this.client.query({
        query: GET_PAGE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      return data.getPageById;
    } catch (error) {
      console.error('Error fetching page by ID:', error);
      return null;
    }
  }

  async createPage(input: CreatePageInput): Promise<CMSPage> {
    const { data } = await this.client.mutate({
      mutation: CREATE_PAGE,
      variables: { input },
      refetchQueries: [{ query: GET_ALL_PAGES }],
    });
    return data.createPage;
  }

  async updatePage(id: string, input: UpdatePageInput): Promise<CMSPage> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_PAGE,
      variables: { id, input },
      refetchQueries: [{ query: GET_ALL_PAGES }],
    });
    return data.updatePage;
  }

  async deletePage(id: string): Promise<boolean> {
    const { data } = await this.client.mutate({
      mutation: DELETE_PAGE,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_PAGES }],
    });
    return data.deletePage;
  }

  async togglePagePublishStatus(id: string): Promise<CMSPage> {
    const { data } = await this.client.mutate({
      mutation: TOGGLE_PAGE_PUBLISH_STATUS,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_PAGES }],
    });
    return data.togglePagePublishStatus;
  }

  // Navigation Operations
  async getAllNavItems(): Promise<NavItem[]> {
    const { data } = await this.client.query({
      query: GET_ALL_NAV_ITEMS,
      fetchPolicy: 'network-only',
    });
    return data.getAllNavItems;
  }

  async getVisibleNavItems(): Promise<NavItem[]> {
    const { data } = await this.client.query({
      query: GET_VISIBLE_NAV_ITEMS,
      fetchPolicy: 'network-only',
    });
    return data.getVisibleNavItems;
  }

  async createNavItem(input: CreateNavItemInput): Promise<NavItem> {
    const { data } = await this.client.mutate({
      mutation: CREATE_NAV_ITEM,
      variables: { input },
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    });
    return data.createNavItem;
  }

  async updateNavItem(id: string, input: UpdateNavItemInput): Promise<NavItem> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_NAV_ITEM,
      variables: { id, input },
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    });
    return data.updateNavItem;
  }

  async deleteNavItem(id: string): Promise<boolean> {
    const { data } = await this.client.mutate({
      mutation: DELETE_NAV_ITEM,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    });
    return data.deleteNavItem;
  }

  async reorderNavItems(itemIds: string[]): Promise<boolean> {
    const { data } = await this.client.mutate({
      mutation: REORDER_NAV_ITEMS,
      variables: { input: { itemIds } },
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    });
    return data.reorderNavItems;
  }

  async toggleNavItemVisibility(id: string): Promise<NavItem> {
    const { data } = await this.client.mutate({
      mutation: TOGGLE_NAV_ITEM_VISIBILITY,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    });
    return data.toggleNavItemVisibility;
  }
}
