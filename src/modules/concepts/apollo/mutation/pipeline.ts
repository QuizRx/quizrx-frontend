import { TypedDocumentNode, gql } from "@apollo/client";
import {
  CreatePipelineInput,
  Pipeline,
  UpdatePipelineInput,
  UpdatePipelineFlowInput,
} from "../../types/api/pipeline";

export const CREATE_PIPELINE_MUTATION: TypedDocumentNode<
  {
    createPipeline: Pipeline;
  },
  {
    pipelineData: CreatePipelineInput;
  }
> = gql`
  mutation CreatePipeline($pipelineData: CreatePipelineInput!) {
    createPipeline(pipelineData: $pipelineData) {
      _id
      createdAt
      name
      updatedAt
      userId
    }
  }
`;

export const UPDATE_PIPELINE_MUTATION: TypedDocumentNode<
  {
    updatePipeline: Pipeline;
  },
  {
    updatePipelineId: string;
    pipelineData: UpdatePipelineInput;
  }
> = gql`
  mutation UpdatePipeline(
    $pipelineData: UpdatePipelineInput!
    $updatePipelineId: String!
  ) {
    updatePipeline(pipelineData: $pipelineData, id: $updatePipelineId) {
      _id
      createdAt
      name
      nodes {
        _id
        connections
        createdAt
        data
        description
        name
        type
        updatedAt
      }
      updatedAt
      userId
    }
  }
`;

export const DELETE_PIPELINE_MUTATION: TypedDocumentNode<
  { deletePipeline: boolean },
  { deletePipelineId: string }
> = gql`
  mutation DeletePipeline($deletePipelineId: String!) {
    deletePipeline(id: $deletePipelineId)
  }
`;

export const UPDATE_PIPELINE_FLOW_MUTATION: TypedDocumentNode<
  {
    updatePipelineFlow: Pipeline;
  },
  {
    id: string;
    flowData: UpdatePipelineFlowInput;
  }
> = gql`
  mutation UpdatePipelineFlow($id: String!, $flowData: UpdatePipelineFlowInput!) {
    updatePipelineFlow(id: $id, flowData: $flowData) {
      _id
      name
      nodes {
        id
        type
        position {
          x
          y
        }
        data {
          id
          type
          name
          description
          color
          isEditingName
          isEditingDescription
          formData
          additionalData
          input_variables
        }
        measured {
          width
          height
        }
        selected
        dragging
      }
      edges {
        id
        source
        target
        sourceHandle
        targetHandle
        style {
          stroke
          strokeWidth
        }
        animated
        selected
      }      userId
      createdAt
      updatedAt
    }
  }
`;

// Types for AnswerUsingPipeline mutation
export interface ToolCall {
  name: string;
  arguments: string;
  result: string;
}

export interface AnswerUsingPipelineResponse {
  statusCode: number;
  message: string;
  response: string;
  lastNodeId: string;
  toolCalls: ToolCall[];
  timeTaken: number;
  threadId?: string;
  error?: string;
}

export const ANSWER_USING_PIPELINE_MUTATION: TypedDocumentNode<
  {
    answerUsingPipeline: AnswerUsingPipelineResponse;
  },
  {
    flowData: UpdatePipelineFlowInput;
    userMessage: string;
    threadId?: string;
  }
> = gql`
  mutation AnswerUsingPipeline($flowData: UpdatePipelineFlowInput!, $userMessage: String!, $threadId: String) {
    answerUsingPipeline(flowData: $flowData, userMessage: $userMessage, threadId: $threadId) {
      statusCode
      message
      response
      lastNodeId
      toolCalls {
        name
        arguments
        result
      }
      timeTaken
      threadId
      error
    }
  }
`;
