import {
  dataStructureKnowledgeBase,
  getDataStructureChapter,
  getDataStructureChapters,
  searchDataStructureConcepts,
} from "./data-structure";

export type {
  CodeExample,
  ConceptSearchResult,
  CourseChapter,
  CourseKnowledgeBase,
  KnowledgeConcept,
} from "./types";

export {
  dataStructureKnowledgeBase,
  getDataStructureChapter,
  getDataStructureChapters,
  searchDataStructureConcepts,
};

export function getCourseKnowledgeBase(courseId: string) {
  if (courseId === dataStructureKnowledgeBase.id) {
    return dataStructureKnowledgeBase;
  }

  return null;
}
