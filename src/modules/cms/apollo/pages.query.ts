import { gql } from '@apollo/client';

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
