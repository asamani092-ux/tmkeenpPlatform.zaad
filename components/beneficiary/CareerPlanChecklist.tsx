"use client";

import { useTransition } from "react";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { beneficiaryCopy } from "@/lib/copy/ar";
import type { BeneficiaryTask } from "@/lib/copy/ar";
import { toastSuccess, toastError } from "@/lib/toast";
import { CircleCheck } from "lucide-react";

type Props = {
  tasks: BeneficiaryTask[];
};

export default function CareerPlanChecklist({ tasks: initial }: Props) {
  const [tasks, setTasks] = useSyncFromProps(initial);
  const [pending, startTransition] = useTransition();

  function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.isCompleted) return;
    const nextCompleted = true;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: nextCompleted } : t))
    );

    startTransition(async () => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: nextCompleted }),
      });
      if (!res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, isCompleted: false } : t))
        );
        const data = await res.json().catch(() => ({}));
        toastError(data.error || "فشل تحديث المهمة");
        return;
      }
      toastSuccess("تم إكمال المهمة");
    });
  }

  if (tasks.length === 0) {
    return (
      <section className="card">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-primary">
          <CircleCheck className="h-6 w-6" />
          {beneficiaryCopy.careerChecklist}
        </h2>
        <p className="text-brand-gray">{beneficiaryCopy.noTasks}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
        <CircleCheck className="h-6 w-6" />
        {beneficiaryCopy.careerChecklist}
      </h2>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`field-cell transition ${
              task.isCompleted ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-start">
                <span
                  className={`block font-medium ${
                    task.isCompleted ? "line-through text-brand-gray" : "text-primary"
                  }`}
                >
                  {task.title}
                </span>
                {task.description && (
                  <span className="mt-1 block text-xs text-brand-gray">{task.description}</span>
                )}
              </div>
              <button
                type="button"
                disabled={pending || task.isCompleted}
                onClick={() => handleToggle(task.id)}
                aria-pressed={task.isCompleted}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  task.isCompleted
                    ? "bg-red-800 text-white shadow-sm"
                    : "bg-red-800 text-white shadow-sm hover:bg-red-900"
                } disabled:cursor-default disabled:opacity-100`}
              >
                <CircleCheck className="h-4 w-4" aria-hidden />
                أتممت المهمة
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
