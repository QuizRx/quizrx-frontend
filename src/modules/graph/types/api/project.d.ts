export type Project = {
  name: string;
  type: string;
  environment: string;
  embedding: string;
  size: string;
  status: "active" | "inactive";
};
