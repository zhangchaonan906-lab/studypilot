export type ResourceType =
  | "course_explanation"
  | "mind_map"
  | "practice_questions"
  | "code_practice"
  | "extended_reading"
  | "video_script";

export type ResourceDifficulty = "基础" | "提高" | "冲刺";

export type GeneratedLearningResource = {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  targetConcepts: string[];
  content: string;
  keyPoints: string[];
  difficulty: ResourceDifficulty;
  estimatedMinutes: number;
  agentName: string;
};

export type ResourceGenerationInput = {
  profileSummary: string;
  courseId: string;
  chapterId?: string;
  weakPoints: string[];
  resourceTypes: ResourceType[];
};

export type AgentWorkflowStep = {
  id: string;
  agentName: string;
  title: string;
  description: string;
  status: "completed";
};

export type MatchedKnowledgeContext = {
  chapterTitle: string;
  targetConcepts: string[];
  keyDifficulties: string[];
  commonMistakes: string[];
  questionTypes: string[];
  codeExampleTitle: string;
  codeExampleDescription: string;
  codeExampleCode: string;
  reviewSuggestions: string[];
  found: boolean;
};
