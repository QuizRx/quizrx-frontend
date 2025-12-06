import { ApiResponse } from "@/core/types/api/api";
import { gql, TypedDocumentNode } from "@apollo/client";
import { QuestionBank } from "../../types/api/question-bank";

export const CREATE_QUESTION_BANK_MUTATION: TypedDocumentNode<
  {
    createQuestionBank: QuestionBank;
  },
  {
    createQuestionBankInput: {
      name: string;
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    };
  }
> = gql`
  mutation CreateQuestionBank(
    $createQuestionBankInput: CreateQuestionBankInput!
  ) {
    createQuestionBank(createQuestionBankInput: $createQuestionBankInput) {
      _id
      createdAt
      description
      isPublic
      name
      tags
      updatedAt
      userId
    }
  }
`;

export const UPDATE_QUESTION_BANK_MUTATION: TypedDocumentNode<
  {
    updateQuestionBank: ApiResponse<{ data: QuestionBank }>;
  },
  {
    updateQuestionBankInput: {
      id: string;
      name?: string;
      description?: string;
      tags?: string[];
      isPublic?: boolean;
    };
  }
> = gql`
  mutation UpdateQuestionBank(
    $updateQuestionBankInput: UpdateQuestionBankInput!
  ) {
    updateQuestionBank(updateQuestionBankInput: $updateQuestionBankInput) {
      cause
      data {
        _id
        createdAt
        description
        isPublic
        name
        tags
        updatedAt
        userId
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;

export const REMOVE_QUESTION_BANK_MUTATION: TypedDocumentNode<
  {
    removeQuestionBank: ApiResponse<{ data: QuestionBank }>;
  },
  { removeQuestionBankId: string }
> = gql`
  mutation RemoveQuestionBank($removeQuestionBankId: String!) {
    removeQuestionBank(id: $removeQuestionBankId) {
      cause
      data {
        _id
        createdAt
        description
        isPublic
        name
        tags
        updatedAt
        userId
      }
      error
      message
      status
      statusCode
      subscriptionRoute
    }
  }
`;

export const ADD_QUESTIONS_TO_BANK_MUTATION: TypedDocumentNode<
  {
    addQuestionsToBank: QuestionBank;
  },
  { addQuestionsInput: { questionBankId: string; questionIds: string[] } }
> = gql`
  mutation AddQuestionsToBank($addQuestionsInput: AddQuestionsToBankInput!) {
    addQuestionsToBank(addQuestionsInput: $addQuestionsInput) {
      _id
      createdAt
      description
      isPublic
      name
      tags
      updatedAt
      userId
    }
  }
`;

export const REMOVE_QUESTIONS_FROM_BANK_MUTATION: TypedDocumentNode<
  {
    removeQuestionsFromBank: QuestionBank;
  },
  { removeQuestionsInput: { questionBankId: string; questionIds: string[] } }
> = gql`
  mutation RemoveQuestionsFromBank(
    $removeQuestionsInput: RemoveQuestionsFromBankInput!
  ) {
    removeQuestionsFromBank(removeQuestionsInput: $removeQuestionsInput) {
      _id
      createdAt
      description
      isPublic
      name
      tags
      updatedAt
      userId
    }
  }
`;
