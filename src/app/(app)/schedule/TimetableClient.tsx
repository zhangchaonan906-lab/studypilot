"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TimetableEntry } from "@/lib/study/types";
import {
  createTimetableEntryAction,
  deleteTimetableEntryAction,
  updateTimetableEntryAction,
} from "@/lib/study/timetable-actions";

const WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const PRESET_COLORS = [
  { value: "", label: "默认" },
  { value: "blue", label: "蓝色" },
  { value: "violet", label: "紫色" },
  { value: "emerald", label: "绿色" },
  { value: "amber", label: "橙色" },
  { value: "rose", label: "红色" },
  { value: "slate", label: "灰色" },
];

function colorClasses(color: string | null) {
  if (!color) return "border-l-blue-500 bg-blue-50";
  const map: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-50",
    violet: "border-l-violet-500 bg-violet-50",
    emerald: "border-l-emerald-500 bg-emerald-50",
    amber: "border-l-amber-500 bg-amber-50",
    rose: "border-l-rose-500 bg-rose-50",
    slate: "border-l-slate-500 bg-slate-50",
  };
  return map[color] ?? "border-l-blue-500 bg-blue-50";
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

type FormMode = { type: "closed" } | { type: "add" } | { type: "edit"; entry: TimetableEntry };

export function TimetableClient({ initialEntries }: { initialEntries: TimetableEntry[] }) {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setFormMode({ type: "add" });
    dialogRef.current?.showModal();
  }, []);

  const openEdit = useCallback((entry: TimetableEntry) => {
    setFormMode({ type: "edit", entry });
    dialogRef.current?.showModal();
  }, []);

  const closeForm = useCallback(() => {
    dialogRef.current?.close();
    setFormMode({ type: "closed" });
  }, []);

  const handleDeleted = useCallback(() => {
    setPendingDelete(null);
    router.refresh();
  }, [router]);

  const entriesByWeekday = groupByWeekday(initialEntries);

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">本周课程</h2>
        <button type="button" onClick={openAdd} className="btn-primary text-sm">
          + 添加课程
        </button>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-7">
        {WEEKDAY_LABELS.map((label, index) => {
          const weekday = index + 1;
          const dayEntries = entriesByWeekday.get(weekday) ?? [];
          return (
            <div key={weekday} className="rounded-2xl border border-slate-200 bg-white p-3">
              <h3 className="mb-3 text-center text-sm font-bold text-slate-600">{label}</h3>
              {dayEntries.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">暂无课程</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <CourseCard
                      key={entry.id}
                      entry={entry}
                      pendingDelete={pendingDelete === entry.id}
                      onEdit={() => openEdit(entry)}
                      onDelete={() => setPendingDelete(entry.id)}
                      onConfirmDelete={() => handleDeleted()}
                      onCancelDelete={() => setPendingDelete(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked accordion-style */}
      <div className="space-y-3 lg:hidden">
        {WEEKDAY_LABELS.map((label, index) => {
          const weekday = index + 1;
          const dayEntries = entriesByWeekday.get(weekday) ?? [];
          return (
            <details key={weekday} className="rounded-2xl border border-slate-200 bg-white">
              <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-600">
                {label}
                {dayEntries.length > 0 ? (
                  <span className="ml-2 text-xs text-slate-400">({dayEntries.length} 门课)</span>
                ) : null}
              </summary>
              <div className="px-4 pb-3">
                {dayEntries.length === 0 ? (
                  <p className="py-3 text-center text-xs text-slate-400">暂无课程</p>
                ) : (
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <CourseCard
                        key={entry.id}
                        entry={entry}
                        pendingDelete={pendingDelete === entry.id}
                        onEdit={() => openEdit(entry)}
                        onDelete={() => setPendingDelete(entry.id)}
                        onConfirmDelete={() => handleDeleted()}
                        onCancelDelete={() => setPendingDelete(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeForm();
        }}
      >
        <div className="w-[min(32rem,90vw)] p-6">
          {formMode.type !== "closed" ? (
            <TimetableForm mode={formMode} onClose={closeForm} onSuccess={() => router.refresh()} />
          ) : null}
        </div>
      </dialog>
    </section>
  );
}

function CourseCard({
  entry,
  pendingDelete,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  entry: TimetableEntry;
  pendingDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  if (pendingDelete) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-sm">
        <p className="text-xs font-semibold text-red-700">确定删除这门课程？</p>
        <div className="mt-2 flex items-center gap-2">
          <DeleteForm entryId={entry.id} onSuccess={onConfirmDelete} />
          <button
            type="button"
            onClick={onCancelDelete}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-l-4 p-2.5 text-sm ${colorClasses(entry.color)}`}>
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{entry.course_name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
          </p>
          {entry.location ? (
            <p className="mt-0.5 truncate text-xs text-slate-500">{entry.location}</p>
          ) : null}
          {entry.teacher ? (
            <p className="truncate text-xs text-slate-500">{entry.teacher}</p>
          ) : null}
          {entry.note ? (
            <p className="mt-0.5 truncate text-xs text-slate-400">{entry.note}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1 text-xs text-slate-400 transition hover:bg-white hover:text-slate-600"
            aria-label="编辑课程"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1 text-xs text-slate-400 transition hover:bg-white hover:text-red-500"
            aria-label="删除课程"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteForm({ entryId, onSuccess }: { entryId: string; onSuccess: () => void }) {
  const [formState, formAction, isPending] = useActionState(deleteTimetableEntryAction, {});
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !isPending && formState?.success) {
      onSuccess();
    }
    prevPending.current = isPending;
  }, [isPending, formState, onSuccess]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={entryId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        {isPending ? "删除中..." : "确认删除"}
      </button>
    </form>
  );
}

function TimetableForm({
  mode,
  onClose,
  onSuccess,
}: {
  mode: { type: "add" } | { type: "edit"; entry: TimetableEntry };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = mode.type === "edit";
  const entry = isEdit ? mode.entry : null;

  const action = isEdit ? updateTimetableEntryAction : createTimetableEntryAction;
  const [formState, formAction, isPending] = useActionState(action, {});
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !isPending && formState?.success) {
      onClose();
      onSuccess();
    }
    prevPending.current = isPending;
  }, [isPending, formState, onClose, onSuccess]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">
          {isEdit ? "编辑课程" : "添加课程"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        {isEdit ? <input type="hidden" name="id" value={entry!.id} /> : null}

        <label className="block">
          <span className="text-sm font-semibold text-ink">课程名称 *</span>
          <input
            type="text"
            name="course_name"
            required
            defaultValue={entry?.course_name ?? ""}
            maxLength={100}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="例如：高等数学"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">星期几 *</span>
          <select
            name="weekday"
            required
            defaultValue={entry?.weekday ?? ""}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="" disabled>请选择</option>
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={i + 1} value={i + 1}>{label}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-ink">开始时间 *</span>
            <input
              type="time"
              name="start_time"
              required
              defaultValue={entry?.start_time?.slice(0, 5) ?? ""}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">结束时间 *</span>
            <input
              type="time"
              name="end_time"
              required
              defaultValue={entry?.end_time?.slice(0, 5) ?? ""}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-ink">地点</span>
          <input
            type="text"
            name="location"
            defaultValue={entry?.location ?? ""}
            maxLength={200}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="例如：教学楼 A101"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">老师</span>
          <input
            type="text"
            name="teacher"
            defaultValue={entry?.teacher ?? ""}
            maxLength={100}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="老师姓名"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">备注</span>
          <input
            type="text"
            name="note"
            defaultValue={entry?.note ?? ""}
            maxLength={500}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="其他备注"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">颜色标签</span>
          <select
            name="color"
            defaultValue={entry?.color ?? ""}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            {PRESET_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        {formState?.error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {formState.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isPending} className="btn-primary flex-1 text-sm">
            {isPending ? "保存中..." : isEdit ? "保存修改" : "添加课程"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

function groupByWeekday(entries: TimetableEntry[]) {
  const map = new Map<number, TimetableEntry[]>();
  for (let i = 1; i <= 7; i++) {
    map.set(i, []);
  }
  for (const entry of entries) {
    const list = map.get(entry.weekday) ?? [];
    list.push(entry);
    map.set(entry.weekday, list);
  }
  return map;
}
