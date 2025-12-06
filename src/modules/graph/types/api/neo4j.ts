export type CreateNeo4jConfigInput = {
  name: string;
  uri: string;
  username: string;
  password: string;
};

export type UpdateNeo4jConfigInput = Partial<CreateNeo4jConfigInput>;

export type Neo4jConnectionTestInput = {
  uri: string;
  username: string;
  password: string;
};

export type Neo4jConfig = {
  _id: string;
  userId: string;
  name: string;
  uri: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};
