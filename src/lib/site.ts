export type AppRoute = {
  href: string;
  label: string;
  description: string;
};

export type MockPlan = {
  id: string;
  title: string;
  goal: string;
  deadline: string;
  progress: number;
  status: "active" | "completed";
  dailyMinutes: number;
  focus: string;
};

export type TodayTask = {
  title: string;
  detail: string;
  minutes: number;
  done: boolean;
};

export type MistakeItem = {
  id: string;
  subject: string;
  title: string;
  reason: string;
  nextReview: string;
  mastery: number;
};

export type WeeklyMetric = {
  label: string;
  value: string;
  hint: string;
};

export const appRoutes: AppRoute[] = [
  {
    href: "/dashboard",
    label: "学习台",
    description: "总览计划、进度和今日重点",
  },
  {
    href: "/plans/new",
    label: "新建计划",
    description: "输入目标并生成学习安排",
  },
  {
    href: "/today",
    label: "今日任务",
    description: "查看任务、打卡和复盘",
  },
  {
    href: "/review",
    label: "错题复习",
    description: "记录错题并安排复习",
  },
  {
    href: "/weekly",
    label: "周总结",
    description: "回顾本周学习状态",
  },
];

export const mockPlans: MockPlan[] = [
  {
    id: "gaoshu-30",
    title: "高等数学期末冲刺",
    goal: "30 天完成函数、极限、积分和典型题型复习",
    deadline: "2026-06-21",
    progress: 42,
    status: "active",
    dailyMinutes: 90,
    focus: "积分应用",
  },
  {
    id: "cet6-reading",
    title: "六级阅读提分计划",
    goal: "提升长篇阅读速度，稳定完成真题训练",
    deadline: "2026-06-14",
    progress: 28,
    status: "active",
    dailyMinutes: 60,
    focus: "同义替换",
  },
  {
    id: "python-data",
    title: "Python 数据分析入门",
    goal: "掌握 pandas、可视化和一个课程项目",
    deadline: "2026-07-05",
    progress: 16,
    status: "active",
    dailyMinutes: 75,
    focus: "DataFrame 清洗",
  },
];

export const todayTasks: TodayTask[] = [
  {
    title: "复习定积分换元法",
    detail: "整理 3 个常见换元模板，并写出适用条件。",
    minutes: 25,
    done: true,
  },
  {
    title: "完成 8 道典型题",
    detail: "优先做错题本中标记为“概念混淆”的题目。",
    minutes: 40,
    done: false,
  },
  {
    title: "10 分钟主动回忆",
    detail: "合上笔记，写下今天能记住的公式和解题步骤。",
    minutes: 10,
    done: false,
  },
];

export const mistakes: MistakeItem[] = [
  {
    id: "m1",
    subject: "高等数学",
    title: "分部积分边界项漏写",
    reason: "步骤里只关注了公式，没有检查上下限代入。",
    nextReview: "明天",
    mastery: 2,
  },
  {
    id: "m2",
    subject: "英语六级",
    title: "把 infer 题当细节题处理",
    reason: "定位后直接选原文近义句，忽略了作者态度。",
    nextReview: "3 天后",
    mastery: 3,
  },
  {
    id: "m3",
    subject: "Python",
    title: "groupby 后索引层级混乱",
    reason: "没有在聚合后 reset_index，导致图表字段读取失败。",
    nextReview: "本周五",
    mastery: 2,
  },
];

export const weeklyMetrics: WeeklyMetric[] = [
  {
    label: "学习时长",
    value: "8.5h",
    hint: "比上周多 1.2h",
  },
  {
    label: "任务完成率",
    value: "76%",
    hint: "连续 4 天打卡",
  },
  {
    label: "新增错题",
    value: "12",
    hint: "高数占 7 题",
  },
  {
    label: "复盘质量",
    value: "良好",
    hint: "建议增加原因分析",
  },
];

export const planDays = [
  {
    day: 1,
    date: "5 月 23 日",
    theme: "诊断当前水平",
    tasks: ["完成基础测试", "标记薄弱章节", "整理公式清单"],
  },
  {
    day: 2,
    date: "5 月 24 日",
    theme: "极限与连续",
    tasks: ["复习等价无穷小", "完成 10 道极限题", "错题二次讲解"],
  },
  {
    day: 3,
    date: "5 月 25 日",
    theme: "导数应用",
    tasks: ["梳理单调性题型", "完成真题训练", "写 100 字复盘"],
  },
  {
    day: 4,
    date: "5 月 26 日",
    theme: "积分计算",
    tasks: ["换元法练习", "分部积分练习", "复习昨日错题"],
  },
];

export function findPlan(id: string) {
  return mockPlans.find((plan) => plan.id === id) ?? mockPlans[0];
}
