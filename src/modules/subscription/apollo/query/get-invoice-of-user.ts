import { gql, TypedDocumentNode } from "@apollo/client";
import { Invoice } from "@/core/types/stripe/invoice";

export type GetInvoicesResponse = Invoice[];

export const GET_INVOICE_OF_USER: TypedDocumentNode<
  { getInvoices: GetInvoicesResponse },
  void
> = gql`
  query GetInvoices {
    getInvoices
  }
`;
