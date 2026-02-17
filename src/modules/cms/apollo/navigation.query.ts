import { gql } from '@apollo/client';

export const GET_ALL_NAV_ITEMS = gql`
  query GetAllNavItems {
    getAllNavItems {
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
      updatedAt
    }
  }
`;

export const GET_VISIBLE_NAV_ITEMS = gql`
  query GetVisibleNavItems {
    getVisibleNavItems {
      _id
      name
      href
      order
      subMenus {
        name
        href
      }
    }
  }
`;

export const GET_NAV_ITEM_BY_ID = gql`
  query GetNavItemById($id: String!) {
    getNavItemById(id: $id) {
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
      updatedAt
    }
  }
`;
