'use client';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
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
} from '../apollo/types';
import { useMemo } from 'react';
import { CMSService } from '../services/cms.service';

// Page Hooks
export function useAllPages(filter?: PageFilterInput) {
  return useQuery<{ getAllPages: CMSPage[] }>(GET_ALL_PAGES, {
    variables: { filter },
    fetchPolicy: 'network-only',
  });
}

export function usePublishedPages() {
  return useQuery<{ getPublishedPages: CMSPage[] }>(GET_PUBLISHED_PAGES, {
    fetchPolicy: 'network-only',
  });
}

export function usePageBySlug(slug: string, onlyPublished = true) {
  return useQuery<{ getPageBySlug: CMSPage }>(GET_PAGE_BY_SLUG, {
    variables: { slug, onlyPublished },
    skip: !slug,
    fetchPolicy: 'network-only',
  });
}

export function usePageById(id: string) {
  return useQuery<{ getPageById: CMSPage }>(GET_PAGE_BY_ID, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });
}

export function useCreatePage() {
  const [mutate, result] = useMutation<
    { createPage: CMSPage },
    { input: CreatePageInput }
  >(CREATE_PAGE, {
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });

  return {
    createPage: (input: CreatePageInput) => mutate({ variables: { input } }),
    ...result,
  };
}

export function useUpdatePage() {
  const [mutate, result] = useMutation<
    { updatePage: CMSPage },
    { id: string; input: UpdatePageInput }
  >(UPDATE_PAGE, {
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });

  return {
    updatePage: (id: string, input: UpdatePageInput) =>
      mutate({ variables: { id, input } }),
    ...result,
  };
}

export function useDeletePage() {
  const [mutate, result] = useMutation<{ deletePage: boolean }, { id: string }>(
    DELETE_PAGE,
    {
      refetchQueries: [{ query: GET_ALL_PAGES }],
    }
  );

  return {
    deletePage: (id: string) => mutate({ variables: { id } }),
    ...result,
  };
}

export function useTogglePagePublishStatus() {
  const [mutate, result] = useMutation<
    { togglePagePublishStatus: CMSPage },
    { id: string }
  >(TOGGLE_PAGE_PUBLISH_STATUS, {
    refetchQueries: [{ query: GET_ALL_PAGES }],
  });

  return {
    togglePagePublishStatus: (id: string) => mutate({ variables: { id } }),
    ...result,
  };
}

// Navigation Hooks
export function useAllNavItems() {
  return useQuery<{ getAllNavItems: NavItem[] }>(GET_ALL_NAV_ITEMS, {
    fetchPolicy: 'network-only',
  });
}

export function useVisibleNavItems() {
  return useQuery<{ getVisibleNavItems: NavItem[] }>(GET_VISIBLE_NAV_ITEMS, {
    fetchPolicy: 'cache-first',
  });
}

export function useCreateNavItem() {
  const [mutate, result] = useMutation<
    { createNavItem: NavItem },
    { input: CreateNavItemInput }
  >(CREATE_NAV_ITEM, {
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });

  return {
    createNavItem: (input: CreateNavItemInput) => mutate({ variables: { input } }),
    ...result,
  };
}

export function useUpdateNavItem() {
  const [mutate, result] = useMutation<
    { updateNavItem: NavItem },
    { id: string; input: UpdateNavItemInput }
  >(UPDATE_NAV_ITEM, {
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });

  return {
    updateNavItem: (id: string, input: UpdateNavItemInput) =>
      mutate({ variables: { id, input } }),
    ...result,
  };
}

export function useDeleteNavItem() {
  const [mutate, result] = useMutation<{ deleteNavItem: boolean }, { id: string }>(
    DELETE_NAV_ITEM,
    {
      refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
    }
  );

  return {
    deleteNavItem: (id: string) => mutate({ variables: { id } }),
    ...result,
  };
}

export function useReorderNavItems() {
  const [mutate, result] = useMutation<
    { reorderNavItems: boolean },
    { input: { itemIds: string[] } }
  >(REORDER_NAV_ITEMS, {
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });

  return {
    reorderNavItems: (itemIds: string[]) =>
      mutate({ variables: { input: { itemIds } } }),
    ...result,
  };
}

export function useToggleNavItemVisibility() {
  const [mutate, result] = useMutation<
    { toggleNavItemVisibility: NavItem },
    { id: string }
  >(TOGGLE_NAV_ITEM_VISIBILITY, {
    refetchQueries: [{ query: GET_ALL_NAV_ITEMS }],
  });

  return {
    toggleNavItemVisibility: (id: string) => mutate({ variables: { id } }),
    ...result,
  };
}

// CMS Service Hook
export function useCMSService() {
  const client = useApolloClient();
  return useMemo(() => new CMSService(client as any), [client]);
}
