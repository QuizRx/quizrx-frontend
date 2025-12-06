export enum UserRole {
  OWNER = "OWNER",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  INVITED = "INVITED",
}

export enum Model {
  O4_MINI = 'o4-mini',
  GPT_41 = 'gpt-4.1',
  GPT_41_MINI = 'gpt-4.1-mini',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
}

export enum EmbeddingModel {
  ADA_002 = 'text-embedding-ada-002',
  SMALL_3 = 'text-embedding-3-small',
  LARGE_3 = 'text-embedding-3-large',
}
