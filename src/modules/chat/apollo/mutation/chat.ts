import { TypedDocumentNode, gql } from "@apollo/client";
import { Message, SendMessageInput } from "../../types/api/messages";

export const SEND_MESSAGE_MUTATION: TypedDocumentNode<
  {
    sendMessage: Message[];
  },
  {
    sendMessageInput: SendMessageInput;
  }
> = gql`
  mutation SendMessage($sendMessageInput: SendMessageInput!) {
    sendMessage(sendMessageInput: $sendMessageInput) {
      _id
      content
      createdAt
      senderType
      threadId
      updatedAt
    }
  }
`;
