export type LearningProfileConfidence = "低" | "中" | "高";

export type LearningProfile = {
  majorBackground: string;
  courseTarget: string;
  learningGoal: string;
  currentLevel: string;
  weakPoints: string[];
  availableTime: string;
  learningPreference: string;
  cognitiveStyle: string;
  resourcePreference: string[];
  examOrDeadline?: string;
  confidence: LearningProfileConfidence;
  summary: string;
};
