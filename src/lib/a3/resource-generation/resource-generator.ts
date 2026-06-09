import {
  getCourseKnowledgeBase,
  getDataStructureChapter,
  searchDataStructureConcepts,
} from "../knowledge-base";
import type { CourseChapter } from "../knowledge-base";
import type {
  AgentWorkflowStep,
  GeneratedLearningResource,
  MatchedKnowledgeContext,
  ResourceGenerationInput,
  ResourceType,
} from "./types";

export const defaultA3ResourceTypes: ResourceType[] = [
  "course_explanation",
  "mind_map",
  "practice_questions",
  "code_practice",
  "extended_reading",
];

export const resourceTypeLabels: Record<ResourceType, string> = {
  course_explanation: "课程讲解",
  mind_map: "思维导图",
  practice_questions: "练习题",
  code_practice: "代码实操",
  extended_reading: "拓展阅读",
  video_script: "短视频脚本",
};

export function generateLearningResources(
  input: ResourceGenerationInput,
): GeneratedLearningResource[] {
  const context = matchKnowledgeContext(input);

  return input.resourceTypes.map((type) => buildResource(type, input, context));
}

export function generateAgentWorkflow(
  input: ResourceGenerationInput,
): AgentWorkflowStep[] {
  const weakPointText =
    input.weakPoints.length > 0 ? input.weakPoints.join("、") : "待确认薄弱点";

  return [
    {
      id: "profile-agent",
      agentName: "Profile Agent",
      title: "已分析学习画像",
      description: `读取画像摘要，识别出当前关注点：${weakPointText}。`,
      status: "completed",
    },
    {
      id: "knowledge-agent",
      agentName: "Knowledge Agent",
      title: "已匹配课程知识库",
      description: "从数据结构知识库中抽取章节、核心知识点、难点、易错点和代码案例。",
      status: "completed",
    },
    {
      id: "resource-agent",
      agentName: "Resource Agent",
      title: "已生成讲解资源",
      description: "整理成适合放进复习笔记的讲解、思维导图和拓展阅读。",
      status: "completed",
    },
    {
      id: "exercise-agent",
      agentName: "Exercise Agent",
      title: "已生成练习题",
      description: "按期末复习场景准备选择题、简答题和算法题。",
      status: "completed",
    },
    {
      id: "practice-agent",
      agentName: "Practice Agent",
      title: "已生成代码案例",
      description: "把知识点落到可手写、可调试的 C 语言风格练习。",
      status: "completed",
    },
    {
      id: "review-agent",
      agentName: "Review Agent",
      title: "已生成复习建议",
      description: "给出先看结构、再写代码、最后做题检查边界的学习顺序。",
      status: "completed",
    },
  ];
}

function buildResource(
  type: ResourceType,
  input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  const builders: Record<ResourceType, () => GeneratedLearningResource> = {
    course_explanation: () => buildCourseExplanation(input, context),
    mind_map: () => buildMindMap(input, context),
    practice_questions: () => buildPracticeQuestions(input, context),
    code_practice: () => buildCodePractice(input, context),
    extended_reading: () => buildExtendedReading(input, context),
    video_script: () => buildVideoScript(input, context),
  };

  return builders[type]();
}

function matchKnowledgeContext(input: ResourceGenerationInput): MatchedKnowledgeContext {
  const course = getCourseKnowledgeBase(input.courseId);

  if (!course) {
    return buildFallbackContext();
  }

  const chapter =
    (input.chapterId ? getDataStructureChapter(input.chapterId) : null) ??
    findChapterByWeakPoints(input.weakPoints);

  if (!chapter) {
    return buildFallbackContext();
  }

  const targetConcepts = getTargetConcepts(chapter, input.weakPoints);
  const firstCodeExample = chapter.codeExamples[0];

  return {
    chapterTitle: chapter.title,
    targetConcepts,
    keyDifficulties: chapter.keyDifficulties,
    commonMistakes: chapter.commonMistakes,
    questionTypes: chapter.questionTypes,
    codeExampleTitle: firstCodeExample?.title ?? "基础代码练习",
    codeExampleDescription: firstCodeExample?.description ?? "围绕本章知识点完成一个小练习。",
    codeExampleCode: firstCodeExample?.code ?? "/* 请根据本章知识点补充代码 */",
    reviewSuggestions: chapter.reviewSuggestions,
    found: true,
  };
}

function findChapterByWeakPoints(weakPoints: string[]) {
  for (const weakPoint of weakPoints) {
    const result = searchDataStructureConcepts(weakPoint)[0];
    if (result) {
      return getDataStructureChapter(result.chapter.id);
    }
  }

  return null;
}

function getTargetConcepts(chapter: CourseChapter, weakPoints: string[]) {
  const matched = chapter.coreConcepts
    .filter((concept) =>
      weakPoints.some(
        (weakPoint) =>
          concept.title.includes(weakPoint) ||
          concept.keywords.some((keyword) => keyword.includes(weakPoint)),
      ),
    )
    .map((concept) => concept.title);

  if (matched.length > 0) {
    return matched;
  }

  return chapter.coreConcepts.slice(0, 3).map((concept) => concept.title);
}

function buildFallbackContext(): MatchedKnowledgeContext {
  return {
    chapterTitle: "未匹配章节",
    targetConcepts: ["待确认知识点"],
    keyDifficulties: ["暂未在数据结构知识库中找到对应难点"],
    commonMistakes: ["暂未在数据结构知识库中找到对应易错点"],
    questionTypes: ["先补充知识点后再生成题目"],
    codeExampleTitle: "待补充代码案例",
    codeExampleDescription: "需要先选择数据结构知识库中的章节或知识点。",
    codeExampleCode: "/* 暂未匹配到代码案例 */",
    reviewSuggestions: ["回到知识点选择区，选择线性表、二叉树、图、查找或排序等章节"],
    found: false,
  };
}

function buildBaseResource(
  type: ResourceType,
  context: MatchedKnowledgeContext,
  overrides: Omit<GeneratedLearningResource, "id" | "type" | "targetConcepts">,
): GeneratedLearningResource {
  return {
    id: `${type}-${slugify(context.chapterTitle)}-${slugify(context.targetConcepts[0] ?? "concept")}`,
    type,
    targetConcepts: context.targetConcepts,
    ...overrides,
  };
}

function buildCourseExplanation(
  input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("course_explanation", context);
  }

  const [firstConcept, secondConcept = firstConcept] = context.targetConcepts;
  const [firstDifficulty] = context.keyDifficulties;
  const [firstMistake] = context.commonMistakes;

  return buildBaseResource("course_explanation", context, {
    title: `${context.chapterTitle}复习讲解：先抓 ${firstConcept}`,
    description: "像助教课前串讲一样，把考点、混淆点和复习顺序说清楚。",
    content: [
      `${context.chapterTitle}这章复习时不要先背定义，先看题目会怎么考。`,
      buildConcreteComparisonLine(context.chapterTitle),
      `${firstConcept}通常会和${secondConcept}一起出现，题目喜欢问操作过程、边界条件和复杂度。`,
      `容易混淆：${firstMistake}。复习时可以先画结构图，再把插入、删除或遍历过程手写一遍。`,
      `本章难点：${firstDifficulty}。遇到这类题，不要只写结论，要写出关键步骤。`,
      `小例子：如果题目问${firstConcept}的操作代价，先判断它用的是顺序存储还是链式存储，再分析是否需要移动元素或逐个查找。`,
      `画像参考：${input.profileSummary}`,
    ].join("\n"),
    keyPoints: [
      `先分清 ${context.chapterTitle} 的核心结构`,
      `重点检查：${firstMistake}`,
      `复习顺序：画图、手写过程、做边界题`,
    ],
    difficulty: "基础",
    estimatedMinutes: 18,
    agentName: "Resource Agent",
  });
}

function buildConcreteComparisonLine(chapterTitle: string) {
  if (chapterTitle === "线性表") {
    return "线性表最容易考顺序表和单链表：顺序表靠数组下标找位置，单链表靠指针一个一个找。";
  }

  if (chapterTitle === "树与二叉树") {
    return "二叉树最容易考遍历序列、完全二叉树性质和递归过程，复习时一定要边画树边写访问顺序。";
  }

  if (chapterTitle === "图") {
    return "图这章先分清邻接矩阵和邻接表，再看 DFS、BFS、最短路径分别解决什么问题。";
  }

  return `先把${chapterTitle}里的核心概念拆开看，再对照题型检查自己会不会写步骤。`;
}

function buildMindMap(
  _input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("mind_map", context);
  }

  const concepts = context.targetConcepts.slice(0, 3);

  return buildBaseResource("mind_map", context, {
    title: `${context.chapterTitle}知识点思维导图`,
    description: "用层级文本整理概念关系，方便直接贴进复习笔记。",
    content: [
      context.chapterTitle,
      `├─ ${concepts[0] ?? "核心概念"}`,
      `│  ├─ 先看定义和存储方式`,
      `│  └─ 对应题型：${context.questionTypes[0]}`,
      `├─ ${concepts[1] ?? "常见操作"}`,
      `│  ├─ 写出操作步骤`,
      `│  └─ 检查边界：空结构、单元素、尾部处理`,
      `└─ ${concepts[2] ?? "复杂度"}`,
      `   ├─ 记住最好、平均、最坏情况`,
      `   └─ 易错点：${context.commonMistakes[0]}`,
    ].join("\n"),
    keyPoints: [
      "用层级关系整理知识点",
      "把题型挂到具体概念下面",
      "每个分支都补一个易错边界",
    ],
    difficulty: "基础",
    estimatedMinutes: 12,
    agentName: "Resource Agent",
  });
}

function buildPracticeQuestions(
  _input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("practice_questions", context);
  }

  const concept = context.targetConcepts[0] ?? context.chapterTitle;

  return buildBaseResource("practice_questions", context, {
    title: `${concept}期末风格练习题`,
    description: "一组选择题、简答题和算法题，适合复习后马上自测。",
    content: [
      `选择题：关于${concept}，下列说法哪一项更准确？`,
      `A. 所有操作都可以在 O(1) 完成`,
      `B. 操作复杂度要结合存储方式或结构特点分析`,
      `C. 只要会写代码就不需要画过程图`,
      `D. 边界情况通常不会考`,
      `答案：B`,
      `解析：${context.chapterTitle}题目常考操作过程和复杂度，不能脱离存储方式直接下结论。`,
      "",
      `简答题：说明${concept}中最容易出错的一个边界情况，并给出检查方法。`,
      `答案：可以围绕“${context.commonMistakes[0]}”作答。`,
      `解析：简答题要写清触发场景、错误原因和修正方法。`,
      "",
      `算法题：请写出一个处理${concept}基本操作的算法，并分析时间复杂度。`,
      `答案：先写输入输出，再写核心步骤，最后补充复杂度。`,
      `解析：算法题不要只写代码，期末评分通常会看思路、边界和复杂度。`,
    ].join("\n"),
    keyPoints: [
      "选择题检查概念边界",
      "简答题写清错误原因",
      "算法题补输入、输出和复杂度",
    ],
    difficulty: "提高",
    estimatedMinutes: 20,
    agentName: "Exercise Agent",
  });
}

function buildCodePractice(
  _input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("code_practice", context);
  }

  const concept = context.targetConcepts[0] ?? context.chapterTitle;

  return buildBaseResource("code_practice", context, {
    title: `${concept}代码实操：先跑通一个小函数`,
    description: "把知识点落到可手写、可调试的 C 语言风格练习。",
    content: [
      `实操目标：围绕${concept}完成一个小函数，要求能处理空输入和普通输入。`,
      `关键思路：先写结构定义，再写核心操作，最后用 2-3 个样例检查边界。`,
      "",
      "代码片段：",
      toCStyleSnippet(context),
      "",
      "易错边界：",
      `1. ${context.commonMistakes[0]}`,
      "2. 空结构、单元素结构要单独测。",
      "3. 写完后手算一次时间复杂度，不要只看代码能不能运行。",
    ].join("\n"),
    keyPoints: [
      "先明确输入输出",
      "代码后补边界测试",
      `参考案例：${context.codeExampleTitle}`,
    ],
    difficulty: "提高",
    estimatedMinutes: 25,
    agentName: "Practice Agent",
  });
}

function buildExtendedReading(
  _input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("extended_reading", context);
  }

  return buildBaseResource("extended_reading", context, {
    title: `${context.chapterTitle}拓展阅读方向`,
    description: "不编造链接，只给可检索、可对比、可练习的方向。",
    content: [
      "推荐复习方向：",
      `1. 先查“${context.chapterTitle} 基本操作 复杂度”。`,
      `2. 再查“${context.targetConcepts[0]} 易错题”。`,
      `3. 最后查“${context.codeExampleTitle}”。`,
      "",
      "建议对比：",
      `- ${context.keyDifficulties[0]}`,
      `- ${context.commonMistakes[0]}`,
      "",
      "后续练习：",
      context.reviewSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join("\n"),
    ].join("\n"),
    keyPoints: [
      "不背链接，记检索关键词",
      "把难点和易错点放在一起看",
      "读完资料后马上做 3 道题",
    ],
    difficulty: "基础",
    estimatedMinutes: 15,
    agentName: "Review Agent",
  });
}

function buildVideoScript(
  _input: ResourceGenerationInput,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  if (!context.found) {
    return buildFallbackResource("video_script", context);
  }

  const concept = context.targetConcepts[0] ?? context.chapterTitle;

  return buildBaseResource("video_script", context, {
    title: `${concept}1 分钟讲解脚本`,
    description: "给短视频或课堂小讲解使用的口播提纲。",
    content: [
      `开头：这 1 分钟只讲${concept}怎么复习。`,
      `核心讲解：先分清定义，再看操作过程，最后分析复杂度。`,
      `例子：遇到题目时，先判断它考的是${context.questionTypes[0]}，再写步骤。`,
      `总结：别只背结论，把${context.commonMistakes[0]}这个坑避开。`,
    ].join("\n"),
    keyPoints: [
      "开头直接点题",
      "用一道小题串起来",
      "结尾提醒易错点",
    ],
    difficulty: "基础",
    estimatedMinutes: 8,
    agentName: "Resource Agent",
  });
}

function buildFallbackResource(
  type: ResourceType,
  context: MatchedKnowledgeContext,
): GeneratedLearningResource {
  return buildBaseResource(type, context, {
    title: "暂未匹配到可生成的知识点",
    description: "请先选择数据结构知识库中的章节或知识点。",
    content:
      "暂未在数据结构知识库中找到对应章节。可以先选择线性表、栈和队列、串、树与二叉树、图、查找或排序，再生成资源。",
    keyPoints: ["选择明确章节", "补充薄弱知识点", "再生成资源卡片"],
    difficulty: "基础",
    estimatedMinutes: 5,
    agentName: "Knowledge Agent",
  });
}

function toCStyleSnippet(context: MatchedKnowledgeContext) {
  if (context.chapterTitle === "线性表") {
    return `#include <stdio.h>

int findValue(int arr[], int n, int target) {
  for (int i = 0; i < n; i++) {
    if (arr[i] == target) return i;
  }
  return -1;
}`;
  }

  if (context.chapterTitle === "树与二叉树") {
    return `typedef struct Node {
  int value;
  struct Node *left;
  struct Node *right;
} Node;

int countNodes(Node *root) {
  if (root == NULL) return 0;
  return 1 + countNodes(root->left) + countNodes(root->right);
}`;
  }

  if (context.chapterTitle === "图") {
    return `#include <stdio.h>

void visitNeighbors(int graph[][10], int n, int v) {
  for (int i = 0; i < n; i++) {
    if (graph[v][i] != 0) {
      printf("%d ", i);
    }
  }
}`;
  }

  return context.codeExampleCode;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
