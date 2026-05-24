export type PlanStatus = "active" | "archived" | "completed";
export type TaskPriority = "must" | "should" | "optional";

export type Plan = {
  id: string;
  user_id: string;
  title: string;
  goal: string;
  current_level: string | null;
  deadline: string;
  daily_minutes: number;
  rest_days_per_week: number | null;
  preference: string | null;
  overview: string | null;
  status: PlanStatus;
  created_at: string | null;
};

export type PlanDay = {
  id: string;
  plan_id: string;
  user_id: string;
  day_index: number;
  date: string;
  title: string;
  summary: string | null;
  review_method: string | null;
  created_at: string | null;
};

export type Task = {
  id: string;
  plan_day_id: string;
  user_id: string;
  content: string;
  priority: TaskPriority;
  estimated_minutes: number | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string | null;
};

export type Resource = {
  id: string;
  plan_day_id: string;
  user_id: string;
  title: string;
  type: string | null;
  description: string | null;
  search_keywords: string | null;
  created_at: string | null;
};

export type MistakeReview = {
  id: string;
  user_id: string;
  plan_id: string;
  task_id: string | null;
  date: string;
  question: string | null;
  mistake_reason: string | null;
  correct_method: string | null;
  next_action: string | null;
  created_at: string | null;
};

export type DailyReflection = {
  id: string;
  user_id: string;
  plan_id: string;
  date: string;
  mood: string | null;
  difficulty: string | null;
  note: string | null;
  created_at: string | null;
};

export type WeeklySummary = {
  id: string;
  user_id: string;
  plan_id: string;
  week_index: number;
  start_date: string;
  end_date: string;
  completion_rate: number | null;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  next_week_advice: string | null;
  created_at: string | null;
};

export type PlanInsert = Pick<
  Plan,
  | "title"
  | "goal"
  | "current_level"
  | "deadline"
  | "daily_minutes"
  | "rest_days_per_week"
  | "preference"
  | "overview"
>;

export type MistakeReviewInsert = Pick<
  MistakeReview,
  | "plan_id"
  | "task_id"
  | "date"
  | "question"
  | "mistake_reason"
  | "correct_method"
  | "next_action"
>;

export type DailyReflectionUpsert = Pick<
  DailyReflection,
  "plan_id" | "date" | "mood" | "difficulty" | "note"
>;

export type PlanDetail = {
  plan: Plan;
  days: Array<
    PlanDay & {
      tasks: Task[];
      resources: Resource[];
    }
  >;
};

export type TodayTask = Task & {
  plan_day: PlanDay;
  plan: Pick<Plan, "id" | "title">;
};

export type CompletionSummary = {
  completed: number;
  total: number;
  rate: number;
};

export type TodayStudyDay = {
  plan: Plan;
  day:
    | (PlanDay & {
        tasks: Task[];
        resources: Resource[];
      })
    | null;
  reflection: DailyReflection | null;
  completion: CompletionSummary;
};

export type ReviewPageData = {
  currentPlan: Plan | null;
  mistakes: MistakeReview[];
  todayTasks: TodayTask[];
};

export type DashboardData = {
  activePlans: Plan[];
  currentPlan: Plan | null;
  totalCompletion: CompletionSummary;
  todayCompletion: CompletionSummary;
  daysLeft: number | null;
  latestReflection: DailyReflection | null;
  mistakeCount: number;
  todayTasks: TodayTask[];
  planCompletions: Record<string, number>;
};

export type WeeklyPageData = {
  currentPlan: Plan | null;
  summaries: WeeklySummary[];
  currentWeek: {
    weekIndex: number;
    startDate: string;
    endDate: string;
    taskCount: number;
    reflectionCount: number;
    mistakeCount: number;
  } | null;
};

export type TimetableEntry = {
  id: string;
  user_id: string;
  course_name: string;
  weekday: number;
  start_time: string;
  end_time: string;
  location: string | null;
  teacher: string | null;
  note: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TimetableEntryInsert = Pick<
  TimetableEntry,
  "course_name" | "weekday" | "start_time" | "end_time" | "location" | "teacher" | "note" | "color"
>;

export type TimetableEntryUpdate = Partial<TimetableEntryInsert>;

export type DailyCheckin = {
  id: string;
  user_id: string;
  checkin_date: string;
  created_at: string | null;
};

export type CheckinStats = {
  monthTotal: number;
  streak: number;
  todayCheckedIn: boolean;
};
