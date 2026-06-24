"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { beneficiaryCopy } from "@/lib/copy/ar";
import type { BeneficiaryTask } from "@/lib/copy/ar";
import { toastSuccess, toastError } from "@/lib/toast";
import { CheckCircle, CheckSquare } from "lucide-react";

type Props = {
  tasks: BeneficiaryTask[];
};

export default function CareerPlanChecklist({ tasks: initial }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useSyncFromProps(initial);
  const [pending, startTransition] = useTransition();

  function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextCompleted = !task.isCompleted;
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
          prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !nextCompleted } : t))
        );
        const data = await res.json().catch(() => ({}));
        toastError(data.error || "فشل تحديث المهمة");
        return;
      }
      toastSuccess(nextCompleted ? "تم إكمال المهمة" : "تم إلغاء الإكمال");
      router.refresh();
    });
  }

  if (tasks.length === 0) {
    return (
      <section className="card-section">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-primary">
          <CheckSquare className="h-6 w-6" />
          {beneficiaryCopy.careerChecklist}
        </h2>
        <p className="text-brand-gray">{beneficiaryCopy.noTasks}</p>
      </section>
    );
  }

  return (
    <section className="card-section">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
        <CheckSquare className="h-6 w-6" />
        {beneficiaryCopy.careerChecklist}
      </h2>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`rounded-xl border border-surface-border p-4 transition ${
              task.isCompleted ? "bg-primary/5" : "hover:bg-surface-muted"
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
                className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-bold transition ${
                  task.isCompleted
                    ? "border-primary bg-primary text-white"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {task.isCompleted ? "مكتملة" : "أتممت المهمة"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
