"use client";



import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { beneficiaryCopy } from "@/lib/copy/ar";

import type { BeneficiaryTask } from "@/lib/copy/ar";

import { CheckSquare } from "lucide-react";



type Props = {

  tasks: BeneficiaryTask[];

};



export default function CareerPlanChecklist({ tasks: initial }: Props) {

  const router = useRouter();

  const [tasks, setTasks] = useState(initial);

  const [pending, startTransition] = useTransition();



  function handleToggle(taskId: string) {

    startTransition(async () => {

      const res = await fetch(`/api/tasks/${taskId}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

      });

      if (!res.ok) return;

      setTasks((prev) =>

        prev.map((t) =>

          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t

        )

      );

      router.refresh();

    });

  }



  if (tasks.length === 0) {

    return (

      <section className="card">

        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-primary">

          <CheckSquare className="h-6 w-6" />

          {beneficiaryCopy.careerChecklist}

        </h2>

        <p className="text-brand-gray">{beneficiaryCopy.noTasks}</p>

      </section>

    );

  }



  return (

    <section className="card">

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">

        <CheckSquare className="h-6 w-6" />

        {beneficiaryCopy.careerChecklist}

      </h2>

      <ul className="space-y-2">

        {tasks.map((task) => (

          <li

            key={task.id}

            className={`flex items-center gap-3 rounded-lg border border-surface-border px-4 py-3 text-sm transition ${

              task.isCompleted ? "bg-primary/5 opacity-80" : "hover:bg-surface-muted"

            }`}

          >

            <label className="flex flex-1 cursor-pointer items-center justify-end gap-3">

              <div className="text-right">

                <span

                  className={`block font-medium ${

                    task.isCompleted ? "line-through text-brand-gray" : "text-primary"

                  }`}

                >

                  {task.title}

                </span>

                {task.description && (

                  <span className="mt-0.5 block text-xs text-brand-gray">

                    {task.description}

                  </span>

                )}

              </div>

              <input

                type="checkbox"

                checked={task.isCompleted}

                disabled={pending}

                onChange={() => handleToggle(task.id)}

                className="h-5 w-5 shrink-0 accent-primary"

              />

            </label>

          </li>

        ))}

      </ul>

    </section>

  );

}

