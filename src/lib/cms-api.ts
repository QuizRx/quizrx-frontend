"use client";

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GET_ALL_PAGES,
  GET_PUBLISHED_PAGES,
  GET_PAGE_BY_SLUG,
  GET_PAGE_BY_ID,
} from '@/modules/cms/apollo/pages.query';
import {
  CREATE_PAGE,
  UPDATE_PAGE,
  DELETE_PAGE,
  TOGGLE_PAGE_PUBLISH_STATUS,
} from '@/modules/cms/apollo/pages.mutation';
import {
  GET_ALL_NAV_ITEMS,
  GET_VISIBLE_NAV_ITEMS,
  GET_NAV_ITEM_BY_ID,
} from '@/modules/cms/apollo/navigation.query';
import {
  CREATE_NAV_ITEM,
  UPDATE_NAV_ITEM,
  DELETE_NAV_ITEM,
  REORDER_NAV_ITEMS,
  TOGGLE_NAV_ITEM_VISIBILITY,
} from '@/modules/cms/apollo/navigation.mutation';
import {
  CMSPage,
  CreatePageInput,
  UpdatePageInput,
  PageFilterInput,
  NavItem,
  CreateNavItemInput,
  UpdateNavItemInput,
  ReorderNavItemsInput,
} from '@/modules/cms/types/cms.types';

// Page API Functions
export async function getAllPages(
  client: ApolloClient<NormalizedCacheObject>,
  filter?: PageFilterInput
): Promise<CMSPage[]> {
  const { data } = await client.query({
    query: GET_ALL_PAGES,
    variables: { filter },
    fetchPolicy: 'network-only',
  });
  return data.getAllPages;
}

export async function getPublishedPages(
  client: ApolloClient<NormalizedCacheObject>
): Promise<CMSPage[]> {
  const { data } = await client.query({
    query: GET_PUBLISHED_PAGES,
    fetchPolicy: 'network-only',
  });
  return data.getPublishedPages;
}

export async function getPageBySlug(
  client: ApolloClient<NormalizedCacheObject>,
  slug: string,
  onlyPublished: boolean = true
): Promise<CMSPage | null> {
  try {
    const { data } = await client.query({
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

export async function getPageById(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<CMSPage | null> {
  try {
    const { data } = await client.query({
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

export async function createPage(
  client: ApolloClient<NormalizedCacheObject>,
  input: CreatePageInput
): Promise<CMSPage> {
  const { data } = await client.mutate({
    mutation: CREATE_PAGE,
    variables: { input },
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });
  return data.createPage;
}

export async function updatePage(
  client: ApolloClient<NormalizedCacheObject>,
  id: string,
  input: UpdatePageInput
): Promise<CMSPage> {
  const { data } = await client.mutate({
    mutation: UPDATE_PAGE,
    variables: { id, input },
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });
  return data.updatePage;
}

export async function deletePage(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<boolean> {
  const { data } = await client.mutate({
    mutation: DELETE_PAGE,
    variables: { id },
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });
  return data.deletePage;
}

export async function togglePagePublishStatus(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<CMSPage> {
  const { data } = await client.mutate({
    mutation: TOGGLE_PAGE_PUBLISH_STATUS,
    variables: { id },
    refetchQueries: [{ query: GET_ALL_PAGES }, { query: GET_PUBLISHED_PAGES }],
  });
  return data.togglePagePublishStatus;
}

// Navigation API Functions
export async function getAllNavItems(
  client: ApolloClient<NormalizedCacheObject>
): Promise<NavItem[]> {
  const { data } = await client.query({
    query: GET_ALL_NAV_ITEMS,
    fetchPolicy: 'network-only',
  });
  return data.getAllNavItems;
}

export async function getVisibleNavItems(
  client: ApolloClient<NormalizedCacheObject>
): Promise<NavItem[]> {
  const { data } = await client.query({
    query: GET_VISIBLE_NAV_ITEMS,
    fetchPolicy: 'network-only',
  });
  return data.getVisibleNavItems;
}

export async function getNavItemById(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<NavItem | null> {
  try {
    const { data } = await client.query({
      query: GET_NAV_ITEM_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.getNavItemById;
  } catch (error) {
    console.error('Error fetching nav item by ID:', error);
    return null;
  }
}

export async function createNavItem(
  client: ApolloClient<NormalizedCacheObject>,
  input: CreateNavItemInput
): Promise<NavItem> {
  const { data } = await client.mutate({
    mutation: CREATE_NAV_ITEM,
    variables: { input },
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });
  return data.createNavItem;
}

export async function updateNavItem(
  client: ApolloClient<NormalizedCacheObject>,
  id: string,
  input: UpdateNavItemInput
): Promise<NavItem> {
  const { data } = await client.mutate({
    mutation: UPDATE_NAV_ITEM,
    variables: { id, input },
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });
  return data.updateNavItem;
}

export async function deleteNavItem(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<boolean> {
  const { data } = await client.mutate({
    mutation: DELETE_NAV_ITEM,
    variables: { id },
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });
  return data.deleteNavItem;
}

export async function reorderNavItems(
  client: ApolloClient<NormalizedCacheObject>,
  input: ReorderNavItemsInput
): Promise<boolean> {
  const { data } = await client.mutate({
    mutation: REORDER_NAV_ITEMS,
    variables: { input },
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });
  return data.reorderNavItems;
}

export async function toggleNavItemVisibility(
  client: ApolloClient<NormalizedCacheObject>,
  id: string
): Promise<NavItem> {
  const { data } = await client.mutate({
    mutation: TOGGLE_NAV_ITEM_VISIBILITY,
    variables: { id },
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }, { query: GET_VISIBLE_NAV_ITEMS }],
  });
  return data.toggleNavItemVisibility;
}
