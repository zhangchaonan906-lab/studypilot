import { describe, expect, it } from "vitest";
import {
  TASK_NOT_FOUND_ERROR,
  TASK_UPDATE_ERROR,
  updateTaskCompletionForUser,
} from "./task-completion";

type StoredTask = {
  id: string;
  user_id: string;
  is_completed: boolean;
  completed_at: string | null;
};

function createTaskClient(tasks: StoredTask[], updateError: { message: string } | null = null) {
  const filters: Array<{ column: string; value: string }> = [];
  const patches: Array<{ is_completed: boolean; completed_at: string | null }> = [];

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

          const taskId = filters.find((filter) => filter.column === "id")?.value;
          const userId = filters.find((filter) => filter.column === "user_id")?.value;
          const task = tasks.find((item) => item.id === taskId && item.user_id === userId);

          if (!task) {
            return { data: null, error: null };
          }

          const patch = patches.at(-1);

          if (!patch) {
            return { data: null, error: { message: "missing patch" } };
          }

          Object.assign(task, patch);
          return { data: task, error: null };
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
        update(patch: { is_completed: boolean; completed_at: string | null }) {
          patches.push(patch);
          return query;
        },
      };
    },
  };
}

describe("task completion updates", () => {
  it("marks an incomplete task as completed with completed_at", async () => {
    const client = createTaskClient([
      {
        id: "task-1",
        user_id: "user-1",
        is_completed: false,
        completed_at: null,
      },
    ]);

    const result = await updateTaskCompletionForUser(
      client,
      "user-1",
      "task-1",
      true,
      new Date("2026-05-23T08:00:00.000Z")
    );

    expect(result.is_completed).toBe(true);
    expect(result.completed_at).toBe("2026-05-23T08:00:00.000Z");
    expect(client.filters).toContainEqual({ column: "user_id", value: "user-1" });
  });

  it("cancels a completed task and clears completed_at", async () => {
    const client = createTaskClient([
      {
        id: "task-1",
        user_id: "user-1",
        is_completed: true,
        completed_at: "2026-05-23T08:00:00.000Z",
      },
    ]);

    const result = await updateTaskCompletionForUser(
      client,
      "user-1",
      "task-1",
      false,
      new Date("2026-05-23T09:00:00.000Z")
    );

    expect(result.is_completed).toBe(false);
    expect(result.completed_at).toBeNull();
  });

  it("rejects tasks that do not belong to the current user", async () => {
    const client = createTaskClient([
      {
        id: "task-1",
        user_id: "other-user",
        is_completed: false,
        completed_at: null,
      },
    ]);

    await expect(
      updateTaskCompletionForUser(client, "user-1", "task-1", true)
    ).rejects.toThrow(TASK_NOT_FOUND_ERROR);
  });

  it("returns a Chinese update error when Supabase fails", async () => {
    const client = createTaskClient([], { message: "network error" });

    await expect(
      updateTaskCompletionForUser(client, "user-1", "task-1", true)
    ).rejects.toThrow(TASK_UPDATE_ERROR);
  });
});
