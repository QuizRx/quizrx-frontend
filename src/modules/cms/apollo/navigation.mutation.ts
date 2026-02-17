import { gql } from '@apollo/client';

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
