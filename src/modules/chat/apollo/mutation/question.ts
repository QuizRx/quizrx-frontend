// Create a new file for the mutation, e.g., update-question.mutation.ts
import { TypedDocumentNode, gql } from "@apollo/client";
import { Question, UpdateQuestionInput } from "../../types/api/question";

export const UPDATE_QUESTION_MUTATION: TypedDocumentNode<
  {
    updateQuestion: Question;
  },
  {
    updateQuestionInput: UpdateQuestionInput;
  }
> = gql`
  mutation UpdateQuestion($updateQuestionInput: UpdateQuestionInput!) {
    updateQuestion(updateQuestionInput: $updateQuestionInput) {
      _id
      answer
      choices
      createdAt
      explanation
      isSaved
      level
      question
      questionBankId
      question_type
      sub_topic
      topic
      updatedAt
      isUserAnswerCorrect
      userId
    }
  }
`;

export const REATTEMPT_QUESTION_MUTATION: TypedDocumentNode<
  {
    reattemptQuestion: {
      _id: string;
      title: string;
      description: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    };
  },
  {
    input: {
      questionId: string;
    };
  }
> = gql`
  mutation ReattemptQuestion($input: ReattemptQuestionInput!) {
    reattemptQuestion(input: $input) {
      _id
      title
      description
      userId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_QUESTION = gql`
  mutation DeleteQuestion($id: String!) {
    deleteQuestion(id: $id)
  }
`;