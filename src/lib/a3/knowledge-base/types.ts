export type CourseKnowledgeBase = {
  id: string;
  title: string;
  description: string;
  audience: string;
  chapters: CourseChapter[];
};

export type CourseChapter = {
  id: string;
  order: number;
  title: string;
  introduction: string;
  learningObjectives: string[];
  coreConcepts: KnowledgeConcept[];
  keyDifficulties: string[];
  commonMistakes: string[];
  questionTypes: string[];
  codeExamples: CodeExample[];
  reviewSuggestions: string[];
};

export type KnowledgeConcept = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
};

export type CodeExample = {
  id: string;
  title: string;
  language: string;
  description: string;
  code: string;
  highlights: string[];
};

export type ConceptSearchResult = {
  course: Pick<CourseKnowledgeBase, "id" | "title">;
  chapter: Pick<CourseChapter, "id" | "order" | "title">;
  concept: KnowledgeConcept;
};
