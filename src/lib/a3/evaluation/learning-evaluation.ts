import { searchDataStructureConcepts } from "../knowledge-base";
import type {
  EvaluationAgentStep,
  LearningEvaluationInput,
  LearningEvaluationReport,
} from "./types";

const dataStructureAdvice: Record<string, string> = {
  线性表: "线性表薄弱：先区分顺序表和链表，再练插入删除的边界条件。",
  栈: "栈薄弱：先手画入栈、出栈过程，再做括号匹配和表达式题。",
  队列: "队列薄弱：先弄清 front 和 rear，再练循环队列判空判满。",
  串: "串薄弱：先手算 next 数组，再比较朴素匹配和 KMP 的移动过程。",
  二叉树: "二叉树薄弱：先复习遍历规则，再手写递归遍历代码，最后做遍历序列还原题。",
  图: "图薄弱：先画邻接矩阵和邻接表，再比较 DFS 与 BFS。",
  查找: "查找薄弱：先练二分查找边界，再比较二叉排序树和散列表。",
  排序: "排序薄弱：先整理稳定性和复杂度，再手推快排、归并和堆排序过程。",
};

export function generateLearningEvaluation(
  input: LearningEvaluationInput,
): LearningEvaluationReport {
  const completionRate = calculateCompletionRate(input.completedTasks, input.totalTasks);
  const masteryLevel = getMasteryLevel(completionRate);
  const focusLevel = getFocusLevel(input.focusMinutes);
  const riskPoints = buildRiskPoints(input, completionRate, focusLevel);
  const strengths = buildStrengths(input, completionRate, focusLevel);
  const recommendedResourceTypes = buildRecommendedResourceTypes(input);
  const adjustedLearningPath = buildAdjustedLearningPath(input);
  const nextStepSuggestions = buildNextStepSuggestions(input, adjustedLearningPath);

  return {
    masteryLevel,
    completionRate,
    focusLevel,
    riskPoints,
    strengths,
    nextStepSuggestions,
    recommendedResourceTypes,
    adjustedLearningPath,
    summary: buildSummary({
      input,
      completionRate,
      masteryLevel,
      focusLevel,
      adjustedLearningPath,
    }),
  };
}

export function generateEvaluationAgentWorkflow(): EvaluationAgentStep[] {
  return [
    {
      id: "behavior-agent",
      agentName: "Behavior Agent",
      title: "汇总学习行为",
      description: "读取任务完成数、专注时长和笔记数量，先判断今天有没有真正投入。",
    },
    {
      id: "weakness-agent",
      agentName: "Weakness Agent",
      title: "分析薄弱知识点",
      description: "结合错题数量和薄弱点，判断要不要回到基础概念。",
    },
    {
      id: "resource-feedback-agent",
      agentName: "Resource Feedback Agent",
      title: "读取资源反馈",
      description: "根据“很有帮助 / 一般 / 帮助不大”调整下一轮资源类型。",
    },
    {
      id: "evaluation-agent",
      agentName: "Evaluation Agent",
      title: "生成掌握程度",
      description: "按完成率、专注时长和错题压力给出掌握程度与风险点。",
    },
    {
      id: "recommendation-agent",
      agentName: "Recommendation Agent",
      title: "调整学习路径",
      description: "把薄弱知识点映射到数据结构知识库中的复习顺序。",
    },
  ];
}

function calculateCompletionRate(completedTasks: number, totalTasks: number) {
  if (totalTasks <= 0) {
    return 0;
  }

  return Math.round((Math.max(completedTasks, 0) / totalTasks) * 100);
}

function getMasteryLevel(completionRate: number): LearningEvaluationReport["masteryLevel"] {
  if (completionRate < 40) {
    return "基础薄弱";
  }

  if (completionRate < 70) {
    return "正在建立";
  }

  if (completionRate < 90) {
    return "基本掌握";
  }

  return "掌握较好";
}

function getFocusLevel(focusMinutes: number): LearningEvaluationReport["focusLevel"] {
  if (focusMinutes < 30) {
    return "偏低";
  }

  if (focusMinutes <= 120) {
    return "正常";
  }

  return "较好";
}

function buildRiskPoints(
  input: LearningEvaluationInput,
  completionRate: number,
  focusLevel: LearningEvaluationReport["focusLevel"],
) {
  const risks: string[] = [];

  if (completionRate < 40) {
    risks.push("任务完成率偏低，先别急着刷综合题，回到当天最小任务。");
  }

  if (focusLevel === "偏低") {
    risks.push("专注时间偏少，建议先安排 25 分钟只复习一个知识点。");
  }

  if (input.mistakeCount >= 5) {
    risks.push("错题集中，需要回到基础概念，再做同类题。");
  }

  if (input.noteCount === 0) {
    risks.push("缺少笔记沉淀，建议把今天的错因和边界条件写下来。");
  }

  if (input.resourceFeedback === "帮助不大") {
    risks.push("当前资源帮助不大，下一轮要换成更具体的题目、代码和图解。");
  }

  if (risks.length === 0) {
    risks.push("当前风险不高，继续保持任务节奏，同时补一组边界题。");
  }

  return risks;
}

function buildStrengths(
  input: LearningEvaluationInput,
  completionRate: number,
  focusLevel: LearningEvaluationReport["focusLevel"],
) {
  const strengths: string[] = [];

  if (completionRate >= 70) {
    strengths.push("任务推进不错，说明今天不是只看资料，也有实际完成。");
  }

  if (focusLevel !== "偏低") {
    strengths.push("专注时间够用，可以安排一段完整的讲解和练习。");
  }

  if (input.noteCount > 0) {
    strengths.push("已经有笔记沉淀，后面复盘会更容易定位问题。");
  }

  if (input.weakPoints.length > 0) {
    strengths.push(`薄弱点已经比较明确：${input.weakPoints.join("、")}。`);
  }

  if (strengths.length === 0) {
    strengths.push("已经开始记录学习数据，下一步先把任务和错题补完整。");
  }

  return strengths;
}

function buildRecommendedResourceTypes(input: LearningEvaluationInput) {
  if (input.resourceFeedback === "帮助不大") {
    return ["练习题", "代码案例", "图解资料", "错题对照卡"];
  }

  if (input.resourceFeedback === "一般") {
    return ["课程讲解", "练习题", "代码案例"];
  }

  return ["拓展阅读", "综合练习", "项目小练习"];
}

function buildAdjustedLearningPath(input: LearningEvaluationInput) {
  const concepts = uniqueNonEmpty([...input.weakPoints, ...input.recentConcepts]);
  const path: string[] = [];

  for (const concept of concepts) {
    const matchedAdvice = findConceptAdvice(concept);
    if (matchedAdvice) {
      path.push(matchedAdvice);
      continue;
    }

    const result = searchDataStructureConcepts(concept)[0];
    if (result) {
      path.push(
        `${result.concept.title}：先回到${result.chapter.title}的定义和例题，再做 2 道同类题检查。`,
      );
    }
  }

  if (path.length === 0) {
    path.push("先选择一个明确的数据结构知识点，再安排讲解、练习和代码复盘。");
  }

  return path.slice(0, 5);
}

function findConceptAdvice(concept: string) {
  const normalized = concept.trim();

  if (normalized.includes("二叉树")) {
    return dataStructureAdvice["二叉树"];
  }

  return (
    Object.entries(dataStructureAdvice).find(([keyword]) => normalized.includes(keyword))?.[1] ??
    null
  );
}

function buildNextStepSuggestions(input: LearningEvaluationInput, adjustedPath: string[]) {
  const suggestions = [
    adjustedPath[0],
    "下一次学习先做 15 分钟概念复述，再做 2 道选择题检查边界。",
  ];

  if (input.mistakeCount >= 5) {
    suggestions.push("错题先按知识点分组，不要混在一起改。");
  }

  if (input.noteCount === 0) {
    suggestions.push("补一页复习笔记，只写定义、易错点和一个例题。");
  }

  return uniqueNonEmpty(suggestions).slice(0, 4);
}

function buildSummary({
  input,
  completionRate,
  masteryLevel,
  focusLevel,
  adjustedLearningPath,
}: {
  input: LearningEvaluationInput;
  completionRate: number;
  masteryLevel: LearningEvaluationReport["masteryLevel"];
  focusLevel: LearningEvaluationReport["focusLevel"];
  adjustedLearningPath: string[];
}) {
  return [
    `你现在的掌握程度是“${masteryLevel}”，任务完成率 ${completionRate}%，专注状态${focusLevel}。`,
    input.mistakeCount >= 5
      ? "当前主要问题不是没学，而是错题集中，需要先回到基础概念。"
      : "当前可以继续推进，但要用题目检查概念是不是稳。",
    `下一步建议：${adjustedLearningPath[0]}`,
  ].join("");
}

function uniqueNonEmpty(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
