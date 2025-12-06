import { gql, TypedDocumentNode } from "@apollo/client";
import { Topic } from "@/modules/chat/types/api/topics";

export const GET_TOPICS_QUERY: TypedDocumentNode<
  {
    topics: Topic[];
  },
  {}
> = gql`
  query GetTopics {
    topics {
      _id
      title
      id
      description
      subtopics {
        _id
        id
        title
        description
      }
    }
  }
`;

export const FIND_ALL_TOPICS_QUERY: TypedDocumentNode<
  {
    topics: Topic[];
  },
  {}
> = gql`
  query FindAllTopics {
    topics {
      _id
      title
      description
    }
  }
`;