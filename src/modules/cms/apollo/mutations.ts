import { gql } from '@apollo/client';

// Page Mutations
export const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      _id
      title
      slug
      content
      isPublished
      metaTitle
      metaDescription
      metaKeywords
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PAGE = gql`
  mutation UpdatePage($id: String!, $input: UpdatePageInput!) {
    updatePage(id: $id, input: $input) {
      _id
      title
      slug
      content
      isPublished
      metaTitle
      metaDescription
      metaKeywords
      updatedAt
    }
  }
`;

export const DELETE_PAGE = gql`
  mutation DeletePage($id: String!) {
    deletePage(id: $id)
  }
`;

export const TOGGLE_PAGE_PUBLISH_STATUS = gql`
  mutation TogglePagePublishStatus($id: String!) {
    togglePagePublishStatus(id: $id) {
      _id
      isPublished
      updatedAt
    }
  }
`;

// Navigation Mutations
export const CREATE_NAV_ITEM = gql`
  mutation CreateNavItem($input: CreateNavItemInput!) {
    createNavItem(input: $input) {
      _id
      name
      href
      order
      isVisible
      subMenus {
        name
        href
      }
      createdAt
    }
  }
`;

export const UPDATE_NAV_ITEM = gql`
  mutation UpdateNavItem($id: String!, $input: UpdateNavItemInput!) {
    updateNavItem(id: $id, input: $input) {
      _id
      name
      href
      order
      isVisible
      subMenus {
        name
        href
      }
      updatedAt
    }
  }
`;

export const DELETE_NAV_ITEM = gql`
  mutation DeleteNavItem($id: String!) {
    deleteNavItem(id: $id)
  }
`;

export const REORDER_NAV_ITEMS = gql`
  mutation ReorderNavItems($input: ReorderNavItemsInput!) {
    reorderNavItems(input: $input)
  }
`;

export const TOGGLE_NAV_ITEM_VISIBILITY = gql`
  mutation ToggleNavItemVisibility($id: String!) {
    toggleNavItemVisibility(id: $id) {
      _id
      isVisible
      updatedAt
    }
  }
`;
