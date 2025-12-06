export interface Subtopic {
  _id: string;
  title: string;
  id: string;
  description?: string;
}

export interface Topic {
  _id: string;
  id: string;
  title: string;
  description?: string;
  subtopics: Subtopic[];
}