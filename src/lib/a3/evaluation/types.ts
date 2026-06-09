export type ResourceFeedback = "很有帮助" | "一般" | "帮助不大";

export type LearningEvaluationInput = {
  profileSummary: string;
  courseId: string;
  weakPoints: string[];
  completedTasks: number;
  totalTasks: number;
  focusMinutes: number;
  mistakeCount: number;
  noteCount: number;
  resourceFeedback: ResourceFeedback;
  recentConcepts: string[];
};

export type LearningEvaluationReport = {
  masteryLevel: "基础薄弱" | "正在建立" | "基本掌握" | "掌握较好";
  completionRate: number;
  focusLevel: "偏低" | "正常" | "较好";
  riskPoints: string[];
  strengths: string[];
  nextStepSuggestions: string[];
  recommendedResourceTypes: string[];
  adjustedLearningPath: string[];
  summary: string;
};

export type EvaluationAgentStep = {
  id: string;
  agentName: string;
  title: string;
  description: string;
};
