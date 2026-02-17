import { gql } from '@apollo/client';

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
