import { PaginatedParams, PaginatedResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { Pipeline } from "../../types/api/pipeline";

export const GET_USER_PIPELINES_QUERY: TypedDocumentNode<
  {
    getUserPipelines: PaginatedResponse<Pipeline>;
  },
  { pagination?: PaginatedParams }
> = gql`
  query GetUserPipelines($pagination: PaginationArgs) {
    getUserPipelines(pagination: $pagination) {
      data {
        _id
        createdAt
        name
        updatedAt
        userId
      }
      meta {
        lastPage
        limit
        nextPage
        page
        prevPage
        total
      }
    }
  }
`;

export const GET_PIPELINE_BY_ID_QUERY: TypedDocumentNode<
  {
    getPipelineById: Pipeline;
  },
  { id: string }
> = gql`
  query GetPipelineById($getPipelineByIdId: String!) {
    getPipelineById(id: $getPipelineByIdId) {
      _id
      createdAt
      name
      updatedAt
      userId
    }
  }
`;

export const GET_ALL_PIPELINE_INFO: TypedDocumentNode<
  {
    getPipelineById: Pipeline
  },
  { getPipelineByIdId: string }
> = gql`
  query GetPipelineById($getPipelineByIdId: String!) {
    getPipelineById(id: $getPipelineByIdId) {
      _id
      createdAt
      name
      updatedAt
      userId
      edges {
        animated
        id
        selected
        source
        sourceHandle
        target
        targetHandle
        style {
          stroke
          strokeWidth
        }
      }
      nodes {
        dragging
        id
        selected
        type
        data {
          additionalData
          input_variables
          color
          description
          formData
          id
          isEditingDescription
          isEditingName
          name
          type
        }
        measured {
          height
          width
        }
        position {
          x
          y
        }
      }
    }
  }
`;


