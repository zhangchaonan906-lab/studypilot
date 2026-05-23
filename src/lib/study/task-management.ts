export const TASK_UPDATE_ERROR = "任务更新失败，请稍后重试。";
export const TASK_CREATE_ERROR = "任务创建失败，请稍后重试。";
export const TASK_DELETE_ERROR = "任务删除失败，请稍后重试。";
export const TASK_NOT_FOUND_ERROR = "任务不存在或无权修改。";

type SupabaseErrorLike = { message: string };

type TaskRow = {
  id: string;
  plan_day_id: string;
  user_id: string;
  content: string;
  priority: "must" | "should" | "optional";
  estimated_minutes: number | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string | null;
};

type TaskUpdateFields = {
  content?: string;
  estimated_minutes?: number;
  priority?: "must" | "should" | "optional";
};

type TaskCreateFields = {
  content: string;
  estimated_minutes?: number;
  priority: "must" | "should" | "optional";
};

type TaskUpdateQuery = {
  eq(column: string, value: string): TaskUpdateQuery;
  select(columns: string): {
    maybeSingle(): PromiseLike<{
      data: Pick<TaskRow, "id" | "content" | "estimated_minutes" | "priority"> | null;
      error: SupabaseErrorLike | null;
    }>;
  };
};

type TaskCreateQuery = {
  select(): {
    single(): PromiseLike<{ data: TaskRow | null; error: SupabaseErrorLike | null }>;
  };
};

type TaskDeleteQuery = {
  eq(column: string, value: string): TaskDeleteQuery;
  select(columns: string): {
    maybeSingle(): PromiseLike<{
      data: { id: string } | null;
      error: SupabaseErrorLike | null;
    }>;
  };
};

export type TaskUpdateClient = {
  from(table: "tasks"): {
    update(fields: TaskUpdateFields): TaskUpdateQuery;
  };
};

export type TaskCreateClient = {
  from(table: "tasks"): {
    insert(fields: {
      content: string;
      estimated_minutes: number | null;
      priority: string;
      plan_day_id: string;
      user_id: string;
    }): TaskCreateQuery;
  };
};

export type TaskDeleteClient = {
  from(table: "tasks"): {
    delete(): TaskDeleteQuery;
  };
};

export async function updateTaskForUser(
  supabase: TaskUpdateClient,
  userId: string,
  taskId: string,
  fields: TaskUpdateFields,
) {
  const { data, error } = await supabase
    .from("tasks")
    .update(fields)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("id, content, estimated_minutes, priority")
    .maybeSingle();

  if (error) {
    throw new Error(`${TASK_UPDATE_ERROR}`);
  }

  if (!data) {
    throw new Error(TASK_NOT_FOUND_ERROR);
  }

  return data;
}

export async function createTaskForUser(
  supabase: TaskCreateClient,
  userId: string,
  planDayId: string,
  fields: TaskCreateFields,
) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      content: fields.content,
      estimated_minutes: fields.estimated_minutes ?? null,
      priority: fields.priority,
      plan_day_id: planDayId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`${TASK_CREATE_ERROR}`);
  }

  return data;
}

export async function deleteTaskForUser(
  supabase: TaskDeleteClient,
  userId: string,
  taskId: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`${TASK_DELETE_ERROR}`);
  }

  if (!data) {
    throw new Error(TASK_NOT_FOUND_ERROR);
  }

  return data;
}
