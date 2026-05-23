import { describe, expect, it } from "vitest";
import {
  TASK_CREATE_ERROR,
  TASK_DELETE_ERROR,
  TASK_NOT_FOUND_ERROR,
  TASK_UPDATE_ERROR,
  createTaskForUser,
  deleteTaskForUser,
  updateTaskForUser,
  type TaskCreateClient,
  type TaskDeleteClient,
  type TaskUpdateClient,
} from "./task-management";

type StoredTask = {
  id: string;
  user_id: string;
  plan_day_id: string;
  content: string;
  priority: "must" | "should" | "optional";
  estimated_minutes: number | null;
  is_completed: boolean;
  completed_at: string | null;
};

// --- updateTaskForUser test helpers ---

function createUpdateClient(
  tasks: StoredTask[],
  updateError: { message: string } | null = null,
): TaskUpdateClient & { filters: Array<{ column: string; value: string }>; patches: Array<Record<string, unknown>> } {
  const filters: Array<{ column: string; value: string }> = [];
  const patches: Array<Record<string, unknown>> = [];

  const query = {
    eq(column: string, value: string) {
      filters.push({ column, value });
      return query;
    },
    select() {
      return {
        async maybeSingle() {
          if (updateError) {
            return { data: null, error: updateError };
          }

          const taskId = filters.find((f) => f.column === "id")?.value;
          const userId = filters.find((f) => f.column === "user_id")?.value;
          const task = tasks.find((t) => t.id === taskId && t.user_id === userId);

          if (!task) {
            return { data: null, error: null };
          }

          const patch = patches.at(-1) ?? {};
          if (patch.content !== undefined) task.content = patch.content as string;
          if (patch.estimated_minutes !== undefined) task.estimated_minutes = patch.estimated_minutes as number | null;
          if (patch.priority !== undefined) task.priority = patch.priority as StoredTask["priority"];

          return {
            data: {
              id: task.id,
              content: task.content,
              estimated_minutes: task.estimated_minutes,
              priority: task.priority,
            },
            error: null,
          };
        },
      };
    },
  };

  return {
    filters,
    patches,
    from(table: "tasks") {
      expect(table).toBe("tasks");

      return {
        update(fields: Record<string, unknown>) {
          patches.push(fields);
          return query;
        },
      };
    },
  };
}

// --- createTaskForUser test helpers ---

function createInsertClient(
  createError: { message: string } | null = null,
): TaskCreateClient & { inserts: Array<Record<string, unknown>> } {
  const inserts: Array<Record<string, unknown>> = [];

  return {
    inserts,
    from(table: "tasks") {
      expect(table).toBe("tasks");

      return {
        insert(fields: Record<string, unknown>) {
          inserts.push(fields);
          return {
            select() {
              return {
                async single() {
                  if (createError) {
                    return { data: null, error: createError };
                  }

                  return {
                    data: {
                      id: "new-task-id",
                      plan_day_id: fields.plan_day_id,
                      user_id: fields.user_id,
                      content: fields.content,
                      priority: fields.priority,
                      estimated_minutes: fields.estimated_minutes ?? null,
                      is_completed: false,
                      completed_at: null,
                      created_at: "2026-05-24T10:00:00.000Z",
                    },
                    error: null,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

// --- deleteTaskForUser test helpers ---

function createDeleteClient(
  tasks: StoredTask[],
  deleteError: { message: string } | null = null,
): TaskDeleteClient & { filters: Array<{ column: string; value: string }> } {
  const filters: Array<{ column: string; value: string }> = [];

  const query = {
    eq(column: string, value: string) {
      filters.push({ column, value });
      return query;
    },
    select() {
      return {
        async maybeSingle() {
          if (deleteError) {
            return { data: null, error: deleteError };
          }

          const taskId = filters.find((f) => f.column === "id")?.value;
          const userId = filters.find((f) => f.column === "user_id")?.value;
          const index = tasks.findIndex((t) => t.id === taskId && t.user_id === userId);

          if (index === -1) {
            return { data: null, error: null };
          }

          const [deleted] = tasks.splice(index, 1);
          return { data: { id: deleted.id }, error: null };
        },
      };
    },
  };

  return {
    filters,
    from(table: "tasks") {
      expect(table).toBe("tasks");

      return {
        delete() {
          return query;
        },
      };
    },
  };
}

// --- Tests ---

describe("updateTaskForUser", () => {
  const task: StoredTask = {
    id: "task-1",
    user_id: "user-1",
    plan_day_id: "day-1",
    content: "复习第一章",
    priority: "must",
    estimated_minutes: 30,
    is_completed: false,
    completed_at: null,
  };

  it("updates content, estimated_minutes and priority for own task", async () => {
    const client = createUpdateClient([{ ...task }]);

    const result = await updateTaskForUser(client, "user-1", "task-1", {
      content: "复习第二章",
      estimated_minutes: 45,
      priority: "should",
    });

    expect(result.content).toBe("复习第二章");
    expect(result.estimated_minutes).toBe(45);
    expect(result.priority).toBe("should");
    expect(client.filters).toContainEqual({ column: "user_id", value: "user-1" });
  });

  it("rejects update when task belongs to another user", async () => {
    const client = createUpdateClient([{ ...task, user_id: "other-user" }]);

    await expect(
      updateTaskForUser(client, "user-1", "task-1", { content: "修改" }),
    ).rejects.toThrow(TASK_NOT_FOUND_ERROR);
  });

  it("rejects update when task does not exist", async () => {
    const client = createUpdateClient([]);

    await expect(
      updateTaskForUser(client, "user-1", "nonexistent", { content: "修改" }),
    ).rejects.toThrow(TASK_NOT_FOUND_ERROR);
  });

  it("returns Chinese error when Supabase update fails", async () => {
    const client = createUpdateClient([], { message: "network error" });

    await expect(
      updateTaskForUser(client, "user-1", "task-1", { content: "修改" }),
    ).rejects.toThrow(TASK_UPDATE_ERROR);
  });

  it("updates only content when partial fields are provided", async () => {
    const client = createUpdateClient([{ ...task }]);

    const result = await updateTaskForUser(client, "user-1", "task-1", {
      content: "只改内容",
    });

    expect(result.content).toBe("只改内容");
    expect(result.estimated_minutes).toBe(30);
    expect(result.priority).toBe("must");
  });

  it("correctly saves estimated_minutes update", async () => {
    const client = createUpdateClient([{ ...task }]);

    const result = await updateTaskForUser(client, "user-1", "task-1", {
      estimated_minutes: 90,
    });

    expect(result.estimated_minutes).toBe(90);
  });

  it("only allows must/should/optional as priority values", async () => {
    const client = createUpdateClient([{ ...task }]);

    const valid: Array<"must" | "should" | "optional"> = ["must", "should", "optional"];

    for (const p of valid) {
      const result = await updateTaskForUser(client, "user-1", "task-1", { priority: p });
      expect(result.priority).toBe(p);
    }
  });
});

describe("createTaskForUser", () => {
  it("creates a new task for the user's plan day", async () => {
    const client = createInsertClient();

    const result = await createTaskForUser(client, "user-1", "day-1", {
      content: "新增任务",
      estimated_minutes: 20,
      priority: "should",
    });

    expect(result.content).toBe("新增任务");
    expect(result.estimated_minutes).toBe(20);
    expect(result.priority).toBe("should");
    expect(result.plan_day_id).toBe("day-1");
    expect(result.user_id).toBe("user-1");
    expect(result.is_completed).toBe(false);
    expect(result.completed_at).toBeNull();
    expect(client.inserts[0]).toMatchObject({
      content: "新增任务",
      estimated_minutes: 20,
      priority: "should",
      plan_day_id: "day-1",
      user_id: "user-1",
    });
  });

  it("defaults estimated_minutes to null when not provided", async () => {
    const client = createInsertClient();

    const result = await createTaskForUser(client, "user-1", "day-1", {
      content: "无时间的任务",
      priority: "optional",
    });

    expect(result.estimated_minutes).toBeNull();
    expect(client.inserts[0].estimated_minutes).toBeNull();
  });

  it("returns Chinese error when Supabase insert fails", async () => {
    const client = createInsertClient({ message: "network error" });

    await expect(
      createTaskForUser(client, "user-1", "day-1", {
        content: "失败的任务",
        priority: "should",
      }),
    ).rejects.toThrow(TASK_CREATE_ERROR);
  });
});

describe("deleteTaskForUser", () => {
  const task: StoredTask = {
    id: "task-1",
    user_id: "user-1",
    plan_day_id: "day-1",
    content: "删除我",
    priority: "optional",
    estimated_minutes: 10,
    is_completed: true,
    completed_at: "2026-05-23T08:00:00.000Z",
  };

  it("deletes own task", async () => {
    const tasks = [{ ...task }, { ...task, id: "task-2" }];
    const client = createDeleteClient(tasks);

    const result = await deleteTaskForUser(client, "user-1", "task-1");

    expect(result.id).toBe("task-1");
    expect(tasks).toEqual([{ ...task, id: "task-2" }]);
    expect(client.filters).toContainEqual({ column: "id", value: "task-1" });
    expect(client.filters).toContainEqual({ column: "user_id", value: "user-1" });
  });

  it("does not delete task belonging to another user", async () => {
    const tasks = [{ ...task, user_id: "other-user" }];
    const client = createDeleteClient(tasks);

    await expect(
      deleteTaskForUser(client, "user-1", "task-1"),
    ).rejects.toThrow(TASK_NOT_FOUND_ERROR);

    expect(tasks).toEqual([{ ...task, user_id: "other-user" }]);
  });

  it("returns Chinese error when task does not exist", async () => {
    const client = createDeleteClient([]);

    await expect(
      deleteTaskForUser(client, "user-1", "nonexistent"),
    ).rejects.toThrow(TASK_NOT_FOUND_ERROR);
  });

  it("returns Chinese error when Supabase delete fails", async () => {
    const client = createDeleteClient([], { message: "network error" });

    await expect(
      deleteTaskForUser(client, "user-1", "task-1"),
    ).rejects.toThrow(TASK_DELETE_ERROR);
  });

  it("deletes completed task without error", async () => {
    const tasks = [{ ...task, is_completed: true }];
    const client = createDeleteClient(tasks);

    const result = await deleteTaskForUser(client, "user-1", "task-1");

    expect(result.id).toBe("task-1");
    expect(tasks).toEqual([]);
  });
});
