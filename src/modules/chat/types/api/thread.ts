import { BaseEntityProps } from "@/core/types/api/api";

export type CreateThreadInput = {
  initialMessage: string;
  title?: string;
  description?: string;
};

export type Thread = BaseEntityProps & {
  title: string;
  description?: string;
  userId: String;
};
