import { gql } from '@apollo/client';

// Page Queries
export const GET_ALL_PAGES = gql`
  query GetAllPages($filter: PageFilterInput) {
    getAllPages(filter: $filter) {
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

export const GET_PUBLISHED_PAGES = gql`
  query GetPublishedPages {
    getPublishedPages {
      _id
      title
      slug
      content
      metaTitle
      metaDescription
      metaKeywords
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!, $onlyPublished: Boolean = true) {
    getPageBySlug(slug: $slug, onlyPublished: $onlyPublished) {
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

export const GET_PAGE_BY_ID = gql`
  query GetPageById($id: String!) {
    getPageById(id: $id) {
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

// Navigation Queries
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
