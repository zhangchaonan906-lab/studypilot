import type { LearningProfile, LearningProfileConfidence } from "./types";

type KeywordRule = {
  label: string;
  keywords: string[];
};

const majorRules: KeywordRule[] = [
  { label: "大数据管理与应用", keywords: ["大数据管理与应用"] },
  { label: "大数据相关专业", keywords: ["大数据"] },
  { label: "计算机相关专业", keywords: ["计算机", "计算机科学", "计科"] },
  { label: "软件工程", keywords: ["软件工程", "软工"] },
  { label: "人工智能", keywords: ["人工智能", "智能科学"] },
  { label: "数据科学", keywords: ["数据科学", "数据分析"] },
];

const courseRules: KeywordRule[] = [
  { label: "数据结构", keywords: ["数据结构"] },
  { label: "数据库", keywords: ["数据库", "sql"] },
  { label: "高等数学", keywords: ["高数", "高等数学"] },
  { label: "英语六级", keywords: ["英语六级", "六级", "cet6"] },
  { label: "考研数学", keywords: ["考研数学"] },
];

const goalRules: KeywordRule[] = [
  { label: "期末复习", keywords: ["期末", "期末考试"] },
  { label: "考研备考", keywords: ["考研"] },
  { label: "考试冲刺", keywords: ["考试", "冲刺", "复习"] },
  { label: "课程补强", keywords: ["补习", "补强", "提升"] },
];

const levelRules: KeywordRule[] = [
  { label: "基础薄弱", keywords: ["基础薄弱", "零基础", "不太会", "听不懂"] },
  { label: "基础一般", keywords: ["一般", "还可以", "能跟上"] },
  { label: "已有基础", keywords: ["有基础", "学过", "了解"] },
  { label: "较熟练", keywords: ["较熟练", "熟练", "掌握不错"] },
];

export const dataStructureProfileConcepts = [
  "线性表",
  "栈",
  "队列",
  "串",
  "二叉树",
  "树",
  "图",
  "查找",
  "排序",
];

const preferenceRules: KeywordRule[] = [
  { label: "偏好代码实操", keywords: ["喜欢代码", "代码", "实操", "编程"] },
  { label: "偏好例题讲解", keywords: ["例题", "讲解", "案例"] },
  { label: "偏好刷题训练", keywords: ["刷题", "做题", "练习题"] },
  { label: "偏好视频学习", keywords: ["视频", "网课"] },
  { label: "偏好图解理解", keywords: ["图解", "图示", "思维导图"] },
];

const resourcePreferenceRules: KeywordRule[] = [
  { label: "代码例题", keywords: ["代码例题", "代码", "案例", "实操"] },
  { label: "刷题练习", keywords: ["刷题", "做题", "练习题", "题库"] },
  { label: "视频讲解", keywords: ["视频", "网课"] },
  { label: "图解材料", keywords: ["图解", "思维导图", "图示"] },
  { label: "文字讲义", keywords: ["文档", "讲义", "文字"] },
];

export function extractLearningProfileFromText(input: string): LearningProfile {
  const text = input.trim();
  const normalizedText = text.toLowerCase();
  const majorBackground = findFirstLabel(normalizedText, majorRules) ?? "未明确专业背景";
  const courseTarget = findFirstLabel(normalizedText, courseRules) ?? "未明确课程目标";
  const learningGoal = findFirstLabel(normalizedText, goalRules) ?? "未明确学习目标";
  const currentLevel = findFirstLabel(normalizedText, levelRules) ?? inferDefaultLevel(text);
  const weakPoints = extractWeakPoints(text);
  const availableTime = extractAvailableTime(text) ?? "未明确可用学习时间";
  const resourcePreference = findAllLabels(normalizedText, resourcePreferenceRules);
  const learningPreference = buildLearningPreference(normalizedText);
  const cognitiveStyle = inferCognitiveStyle(resourcePreference, normalizedText);
  const examOrDeadline = extractExamOrDeadline(text);
  const confidence = calculateConfidence({
    majorBackground,
    courseTarget,
    learningGoal,
    currentLevel,
    weakPoints,
    availableTime,
    resourcePreference,
    examOrDeadline,
  });

  return {
    majorBackground,
    courseTarget,
    learningGoal,
    currentLevel,
    weakPoints,
    availableTime,
    learningPreference,
    cognitiveStyle,
    resourcePreference,
    examOrDeadline,
    confidence,
    summary: buildSummary({
      majorBackground,
      courseTarget,
      learningGoal,
      currentLevel,
      weakPoints,
      availableTime,
      learningPreference,
      resourcePreference,
      confidence,
    }),
  };
}

export function getRecognizedDataStructureConcepts(input: string) {
  return extractWeakPoints(input);
}

function findFirstLabel(text: string, rules: KeywordRule[]) {
  return rules.find((rule) => includesAny(text, rule.keywords))?.label ?? null;
}

function findAllLabels(text: string, rules: KeywordRule[]) {
  return rules
    .filter((rule) => includesAny(text, rule.keywords))
    .map((rule) => rule.label);
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function inferDefaultLevel(text: string) {
  if (!text.trim()) {
    return "未明确当前基础";
  }

  return "基础情况待进一步确认";
}

function extractWeakPoints(input: string) {
  return dataStructureProfileConcepts
    .filter((concept) => input.includes(concept))
    .filter((concept, index, concepts) => {
      if (concept === "树" && concepts.includes("二叉树")) {
        return false;
      }

      return concepts.indexOf(concept) === index;
    });
}

function extractAvailableTime(input: string) {
  const hourMatch = input.match(/每天\s*(能|可以|可)?\s*(学|学习)?\s*(\d+(?:\.\d+)?)\s*(个)?小时/);
  if (hourMatch) {
    return `每天 ${hourMatch[3]} 小时`;
  }

  const minuteMatch = input.match(/每天\s*(能|可以|可)?\s*(学|学习)?\s*(\d+)\s*分钟/);
  if (minuteMatch) {
    return `每天 ${minuteMatch[3]} 分钟`;
  }

  const weeklyMatch = input.match(/每周\s*(\d+(?:\.\d+)?)\s*(个)?小时/);
  if (weeklyMatch) {
    return `每周 ${weeklyMatch[1]} 小时`;
  }

  return null;
}

function buildLearningPreference(text: string) {
  const preferences = findAllLabels(text, preferenceRules);

  if (preferences.length === 0) {
    return "未明确学习偏好";
  }

  return preferences.join("、");
}

function inferCognitiveStyle(resourcePreference: string[], text: string) {
  if (resourcePreference.some((item) => item.includes("图解")) || text.includes("思维导图")) {
    return "图像化理解";
  }

  if (
    resourcePreference.some((item) => item.includes("代码") || item.includes("刷题")) ||
    text.includes("实操")
  ) {
    return "实践驱动";
  }

  if (resourcePreference.some((item) => item.includes("视频"))) {
    return "听看结合";
  }

  return "待进一步观察";
}

function extractExamOrDeadline(input: string) {
  const deadlineMatch = input.match(/(期末|考试|考研|截止|ddl|DDL)[^，。；;,.]*?(\d+)\s*天/);
  if (deadlineMatch) {
    return `${deadlineMatch[1]}还有 ${deadlineMatch[2]} 天`;
  }

  if (input.includes("期末")) {
    return "期末考试";
  }

  if (input.includes("考研")) {
    return "考研备考";
  }

  return undefined;
}

function calculateConfidence(profile: {
  majorBackground: string;
  courseTarget: string;
  learningGoal: string;
  currentLevel: string;
  weakPoints: string[];
  availableTime: string;
  resourcePreference: string[];
  examOrDeadline?: string;
}): LearningProfileConfidence {
  let score = 0;

  if (!profile.majorBackground.startsWith("未明确")) score += 1;
  if (!profile.courseTarget.startsWith("未明确")) score += 1;
  if (!profile.learningGoal.startsWith("未明确")) score += 1;
  if (!profile.currentLevel.startsWith("未明确") && !profile.currentLevel.includes("待进一步")) {
    score += 1;
  }
  if (profile.weakPoints.length > 0) score += 1;
  if (!profile.availableTime.startsWith("未明确")) score += 1;
  if (profile.resourcePreference.length > 0) score += 1;
  if (profile.examOrDeadline) score += 1;

  if (score >= 6) {
    return "高";
  }

  if (score >= 3) {
    return "中";
  }

  return "低";
}

function buildSummary(profile: {
  majorBackground: string;
  courseTarget: string;
  learningGoal: string;
  currentLevel: string;
  weakPoints: string[];
  availableTime: string;
  learningPreference: string;
  resourcePreference: string[];
  confidence: LearningProfileConfidence;
}) {
  const weakPointText =
    profile.weakPoints.length > 0 ? profile.weakPoints.join("、") : "暂未识别明确短板";
  const resourceText =
    profile.resourcePreference.length > 0
      ? profile.resourcePreference.join("、")
      : "资源偏好待补充";

  return [
    `${profile.majorBackground}学生正在围绕${profile.courseTarget}进行${profile.learningGoal}。`,
    `当前基础：${profile.currentLevel}；知识短板：${weakPointText}。`,
    `可用时间：${profile.availableTime}；偏好：${profile.learningPreference}，适合提供${resourceText}。`,
    `画像置信度：${profile.confidence}。`,
  ].join("");
}
