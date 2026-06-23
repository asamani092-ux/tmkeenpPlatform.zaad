"use client";



import { useState, useTransition, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Stage, SessionStatus } from "@/generated/prisma/client";

import { guideCopy } from "@/lib/copy/ar";
import type { BeneficiaryTask } from "@/lib/copy/ar";
import GuideEvaluationsTab from "@/components/guide/GuideEvaluationsTab";
import SlideOver from "@/components/SlideOver";
import SubmitButton from "@/components/ui/SubmitButton";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import { STAGE_LABELS, getNextStage } from "@/lib/stages";
import { SESSION_STATUS_LABELS } from "@/lib/labels";
import { getUpcomingSession } from "@/lib/upcoming-session";
import { toastSuccess, toastError } from "@/lib/toast";

import {

  ArrowUpCircle,

  Calendar,

  Pencil,

  Trash2,

  X,

  Plus,

  User,

  ListTodo,

  Video,

  Star,

  ExternalLink,

  AlertCircle,

  MapPin,

  Mail,

  Phone,

  MessageCircle,

} from "lucide-react";



type SessionItem = {

  id: string;

  date: string;

  status: string;

  notes: string;

  meetingLink: string | null;

  location: string | null;

  commitmentRating: number | null;

};



type Beneficiary = {

  id: string;

  name: string;

  email: string;

  phone: string;

  stage: Stage;
  pendingStage: Stage | null;
  commitmentScore: number;
  cvContent: string;
  cvUrl: string | null;
  certificatesUrls: string | null;
  professionalRecommendations: string;
  selectedTrainingCourseIds: string[];

  educationLevel: string;

  experience: string;

  skills: string;

  careerInterests: string;

  createdAt: string;

  notes: { id: string; content: string; createdAt: string }[];

  sessions: SessionItem[];

  tasks: BeneficiaryTask[];

};



type Props = {
  beneficiaries: Beneficiary[];
  trainingCourses: { id: string; title: string; provider: string }[];
};

type TabId = "profile" | "sessions" | "tasks" | "evaluations";

export default function GuideBeneficiaryTable({
  beneficiaries: initial,
  trainingCourses,
}: Props) {

  const router = useRouter();

  const [beneficiaries, setBeneficiaries] = useState(initial);

  const [selected, setSelected] = useState<Beneficiary | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const [sessionDate, setSessionDate] = useState("");

  const [sessionNotes, setSessionNotes] = useState("");

  const [sessionMeetingLink, setSessionMeetingLink] = useState("");

  const [sessionLocation, setSessionLocation] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [editTaskTitle, setEditTaskTitle] = useState("");

  const [editTaskDescription, setEditTaskDescription] = useState("");

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const [editSessionDate, setEditSessionDate] = useState("");

  const [editSessionNotes, setEditSessionNotes] = useState("");

  const [editSessionMeetingLink, setEditSessionMeetingLink] = useState("");

  const [editSessionLocation, setEditSessionLocation] = useState("");

  const [editSessionStatus, setEditSessionStatus] = useState<SessionStatus>("SCHEDULED");

  const [editSessionRating, setEditSessionRating] = useState("");

  const [attendingSessionId, setAttendingSessionId] = useState<string | null>(null);

  const [attendRating, setAttendRating] = useState("");

  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);

  const [noteContent, setNoteContent] = useState("");

  const [pending, startTransition] = useTransition();



  useEffect(() => {

    setBeneficiaries(initial);

  }, [initial]);



  useEffect(() => {

    if (!selected) return;

    const onKey = (e: KeyboardEvent) => {

      if (e.key === "Escape") setSelected(null);

    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);

  }, [selected]);



  function openBeneficiary(b: Beneficiary) {

    setSelected(b);

    setActiveTab("profile");

    setSessionDate("");

    setSessionNotes("");

    setSessionMeetingLink("");

    setSessionLocation("");

    setEditingSessionId(null);

    setEditingTaskId(null);

    setAttendingSessionId(null);

    setTaskDrawerOpen(false);

    setSessionDrawerOpen(false);

    setNoteContent("");

  }



  function syncBeneficiary(id: string, patch: Partial<Beneficiary>) {

    setBeneficiaries((prev) =>

      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))

    );

    setSelected((s) => (s?.id === id ? { ...s, ...patch } : s));

  }



  async function handleAddNote() {
    if (!selected || !noteContent.trim()) return;

    startTransition(async () => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryId: selected.id, content: noteContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل حفظ الملاحظة");
        return;
      }
      const newNote = {
        id: data.note.id,
        content: data.note.content,
        createdAt: data.note.createdAt,
      };
      syncBeneficiary(selected.id, {
        notes: [newNote, ...selected.notes],
      });
      setNoteContent("");
      toastSuccess("تم حفظ الملاحظة بنجاح");
    });
  }

  function handleScheduleSession() {

    if (!selected || !sessionDate) return;

    startTransition(async () => {

      const res = await fetch("/api/sessions", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          beneficiaryId: selected.id,

          date: sessionDate,

          notes: sessionNotes,

          meetingLink: sessionMeetingLink,

          location: sessionLocation,

        }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل الجدولة");
        return;
      }

      toastSuccess("تم جدولة الجلسة بنجاح");

      setSessionDate("");

      setSessionNotes("");

      setSessionMeetingLink("");

      setSessionLocation("");

      setSessionDrawerOpen(false);

      router.refresh();

    });

  }



  function startEditSession(s: SessionItem) {

    setEditingSessionId(s.id);

    setEditSessionDate(s.date.slice(0, 16));

    setEditSessionNotes(s.notes);

    setEditSessionMeetingLink(s.meetingLink ?? "");

    setEditSessionLocation(s.location ?? "");

    setEditSessionStatus(s.status as SessionStatus);

    setEditSessionRating(s.commitmentRating?.toString() ?? "");

  }



  function handleUpdateSession() {

    if (!selected || !editingSessionId) return;

    startTransition(async () => {

      const res = await fetch(`/api/sessions/${editingSessionId}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          date: editSessionDate,

          notes: editSessionNotes,

          meetingLink: editSessionMeetingLink,

          location: editSessionLocation,

          status: editSessionStatus,

          commitmentRating: editSessionRating ? Number(editSessionRating) : null,

        }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل التحديث");
        return;
      }

      setEditingSessionId(null);

      toastSuccess("تم تحديث الجلسة");

      router.refresh();

    });

  }



  function handleMarkAttended(sessionId: string) {

    if (!selected) return;

    const rating = Number(attendRating);

    if (!rating || rating < 1 || rating > 5) {
      toastError(guideCopy.commitmentRatingPrompt);
      return;
    }

    startTransition(async () => {

      const res = await fetch(`/api/sessions/${sessionId}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ action: "attend", commitmentRating: rating }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل التحضير");
        return;
      }

      setAttendingSessionId(null);

      setAttendRating("");

      toastSuccess("تم تسجيل حضور الجلسة");

      router.refresh();

    });

  }



  function handleDeleteSession(sessionId: string) {

    if (!selected || !confirm("حذف هذه الجلسة؟")) return;

    startTransition(async () => {

      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        return;
      }

      syncBeneficiary(selected.id, {

        sessions: selected.sessions.filter((s) => s.id !== sessionId),

      });

      toastSuccess("تم حذف الجلسة");

      router.refresh();

    });

  }



  function handleCreateTask() {

    if (!selected || !newTaskTitle.trim()) return;

    startTransition(async () => {

      const res = await fetch("/api/tasks", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          beneficiaryId: selected.id,

          title: newTaskTitle,

          description: newTaskDescription,

        }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل إضافة المهمة");
        return;
      }

      const newTask: BeneficiaryTask = {

        id: data.taskId,

        title: newTaskTitle.trim(),

        description: newTaskDescription.trim() || null,

        isCompleted: false,

      };

      syncBeneficiary(selected.id, {

        tasks: [...selected.tasks, newTask],

      });

      setNewTaskTitle("");

      setNewTaskDescription("");

      setTaskDrawerOpen(false);

      toastSuccess("تمت إضافة المهمة");

      router.refresh();

    });

  }



  function startEditTask(t: BeneficiaryTask) {

    setEditingTaskId(t.id);

    setEditTaskTitle(t.title);

    setEditTaskDescription(t.description ?? "");

  }



  function handleUpdateTask() {

    if (!selected || !editingTaskId) return;

    startTransition(async () => {

      const res = await fetch(`/api/tasks/${editingTaskId}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          title: editTaskTitle,

          description: editTaskDescription,

        }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل التحديث");
        return;
      }

      syncBeneficiary(selected.id, {

        tasks: selected.tasks.map((t) =>

          t.id === editingTaskId

            ? {

                ...t,

                title: editTaskTitle.trim(),

                description: editTaskDescription.trim() || null,

              }

            : t

        ),

      });

      setEditingTaskId(null);

      toastSuccess("تم تحديث المهمة");

    });

  }



  function handleDeleteTask(taskId: string) {

    if (!selected || !confirm("حذف هذه المهمة؟")) return;

    startTransition(async () => {

      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        return;
      }

      syncBeneficiary(selected.id, {

        tasks: selected.tasks.filter((t) => t.id !== taskId),

      });

      toastSuccess("تم حذف المهمة");

    });

  }



  function handleRecommendStage() {

    if (!selected) return;

    startTransition(async () => {

      const res = await fetch("/api/stage-upgrade", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ beneficiaryId: selected.id }),

      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "فشل التوصية");
        return;
      }

      const pendingStage = data.pendingStage as Stage;
      syncBeneficiary(selected.id, { pendingStage });
      toastSuccess(
        pendingStage === "TRAINING"
          ? "تم إرسال توصية الانتقال للتدريب — بانتظار اعتماد المدير"
          : `تم إرسال طلب الانتقال إلى ${STAGE_LABELS[pendingStage]} — بانتظار اعتماد المدير`
      );
    });

  }



  const tabs: { id: TabId; label: string; icon: typeof User }[] = [

    { id: "profile", label: guideCopy.profileTab, icon: User },

    { id: "sessions", label: guideCopy.sessionsTab, icon: Calendar },

    { id: "tasks", label: guideCopy.tasksTab, icon: ListTodo },

    { id: "evaluations", label: guideCopy.evaluationsTab, icon: Star },

  ];



  const tableColumns: DataTableColumn<Beneficiary>[] = [
    {
      key: "name",
      header: "الاسم",
      render: (b) => (
        <span className="font-medium text-primary">{b.name}</span>
      ),
    },
    {
      key: "phone",
      header: "الجوال",
      render: (b) => (
        <span className="text-brand-gray" dir="ltr">
          {b.phone}
        </span>
      ),
    },
    {
      key: "stage",
      header: "المرحلة",
      render: (b) => (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {STAGE_LABELS[b.stage]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ التسجيل",
      render: (b) => (
        <span className="text-brand-gray">
          {new Date(b.createdAt).toLocaleDateString("ar-SA")}
        </span>
      ),
    },
    {
      key: "session",
      header: "الجلسة القادمة",
      render: (b) => {
        const upcoming = getUpcomingSession(b.sessions);
        if (!upcoming) return <span className="text-brand-gray">—</span>;
        return (
          <span className="inline-flex items-center justify-end gap-1 text-xs text-primary">
            <Calendar className="h-4 w-4" />
            {new Date(upcoming.date).toLocaleDateString("ar-SA")}
          </span>
        );
      },
    },
    {
      key: "contact",
      header: "التواصل",
      render: (b) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={`tel:${b.phone}`}
            className="rounded p-1 text-primary hover:bg-surface-muted"
            title="اتصال"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${b.email}`}
            className="rounded p-1 text-primary hover:bg-surface-muted"
            title="بريد"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/${b.phone.replace(/\D/g, "").replace(/^0/, "966")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-primary hover:bg-surface-muted"
            title="واتساب"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      ),
    },
  ];

  return (

    <>

      <div className="card overflow-x-auto p-0">

        <DataTable
          columns={tableColumns}
          rows={beneficiaries}
          rowKey={(b) => b.id}
          minWidth="880px"
          emptyMessage="لا يوجد مستفيدون في مرحلة الإرشاد حالياً"
          onRowClick={openBeneficiary}
        />

      </div>



      {selected && (() => {
        const upcomingSession = getUpcomingSession(selected.sessions);

        return (
        <div

          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"

          onClick={() => setSelected(null)}

        >

          <div

            className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="mb-4 flex items-start justify-between">

              <button

                type="button"

                onClick={() => setSelected(null)}

                className="rounded-lg p-1 text-brand-gray hover:bg-surface-muted"

              >

                <X className="h-5 w-5" />

              </button>

              <div className="text-right">

                <h3 className="text-xl font-bold text-primary">{selected.name}</h3>

                <p className="text-sm text-brand-gray">
                  المرحلة: {STAGE_LABELS[selected.stage]}
                  {selected.pendingStage && (
                    <span className="mr-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-red-900">
                      طلب معلّق: {STAGE_LABELS[selected.pendingStage]}
                    </span>
                  )}
                </p>

              </div>

            </div>



            {upcomingSession && (
              <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/15 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {upcomingSession.meetingLink ? (
                      <a
                        href={upcomingSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex !px-3 !py-1.5 text-xs"
                      >
                        <Video className="h-3 w-3" />
                        الدخول للجلسة
                      </a>
                    ) : upcomingSession.location ? (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-gray">
                        <MapPin className="h-3 w-3" />
                        {upcomingSession.location}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-sm font-bold text-primary">
                      <AlertCircle className="h-4 w-4 text-secondary-dark" />
                      جلسة قادمة
                    </p>
                    <p className="text-xs text-brand-gray">
                      {new Date(upcomingSession.date).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
              </div>
            )}



            <div className="mb-6 flex gap-2 border-b border-surface-border pb-2">

              {tabs.map(({ id, label, icon: Icon }) => (

                <button

                  key={id}

                  type="button"

                  onClick={() => setActiveTab(id)}

                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${

                    activeTab === id

                      ? "bg-primary text-white"

                      : "bg-surface-muted text-brand-gray hover:bg-primary/10"

                  }`}

                >

                  <Icon className="h-4 w-4" />

                  {label}

                </button>

              ))}

            </div>



            {activeTab === "profile" && (

              <div className="space-y-4">

                <div className="card-section space-y-3">

                  <h4 className="font-bold text-primary">بيانات المستفيد</h4>

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">

                    <div>

                      <dt className="text-xs font-semibold text-brand-gray">الاسم</dt>

                      <dd className="font-medium text-primary">{selected.name}</dd>

                    </div>

                    <div>

                      <dt className="text-xs font-semibold text-brand-gray">البريد</dt>

                      <dd dir="ltr" className="text-left text-primary">{selected.email}</dd>

                    </div>

                    <div>

                      <dt className="text-xs font-semibold text-brand-gray">الجوال</dt>

                      <dd dir="ltr" className="text-left text-primary">{selected.phone}</dd>

                    </div>

                    <div>

                      <dt className="text-xs font-semibold text-brand-gray">المستوى التعليمي</dt>

                      <dd className="text-primary">{selected.educationLevel || "—"}</dd>

                    </div>

                    <div>

                      <dt className="text-xs font-semibold text-brand-gray">{guideCopy.commitmentScore}</dt>

                      <dd className="text-lg font-bold text-primary">{selected.commitmentScore}</dd>

                    </div>

                    <div className="sm:col-span-2">

                      <dt className="text-xs font-semibold text-brand-gray">الخبرات</dt>

                      <dd className="text-brand-gray">{selected.experience || "—"}</dd>

                    </div>

                    <div className="sm:col-span-2">

                      <dt className="text-xs font-semibold text-brand-gray">المهارات</dt>

                      <dd className="text-brand-gray">{selected.skills || "—"}</dd>

                    </div>

                    <div className="sm:col-span-2">

                      <dt className="text-xs font-semibold text-brand-gray">الميول المهنية</dt>

                      <dd className="text-brand-gray">{selected.careerInterests || "—"}</dd>

                    </div>

                    <div className="sm:col-span-2">

                      <dt className="mb-1 text-xs font-semibold text-brand-gray">السيرة الذاتية</dt>

                      <dd>

                        {selected.cvUrl ? (

                          <a

                            href={selected.cvUrl}

                            target="_blank"

                            rel="noopener noreferrer"

                            className="btn-primary inline-flex !px-3 !py-1.5 text-xs"

                          >

                            <ExternalLink className="h-3 w-3" />

                            عرض السيرة الذاتية المرفقة

                          </a>

                        ) : (

                          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">

                            لا يوجد سيرة ذاتية - يرجى طلبها من المستفيد

                          </span>

                        )}

                      </dd>

                    </div>

                  </dl>

                </div>



                {selected.stage !== "CLOSED" && !selected.pendingStage && getNextStage(selected.stage) && (
                  <button
                    type="button"
                    onClick={handleRecommendStage}
                    disabled={pending}
                    className="btn-recommend flex w-full items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="h-5 w-5" />
                    {getNextStage(selected.stage) === "TRAINING"
                      ? guideCopy.recommendTraining
                      : guideCopy.recommendStage}
                  </button>
                )}

                <div className="card-section space-y-3">
                  <h4 className="font-bold text-primary">ملاحظات المستفيد</h4>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="أضف ملاحظة للمستفيد..."
                  />
                  <SubmitButton
                    type="button"
                    onClick={handleAddNote}
                    loading={pending}
                    disabled={!noteContent.trim()}
                    className="btn-primary w-full !py-2 text-sm"
                  >
                    حفظ الملاحظة
                  </SubmitButton>
                  {selected.notes.length > 0 ? (
                    <ul className="max-h-40 space-y-2 overflow-y-auto">
                      {selected.notes.map((n) => (
                        <li
                          key={n.id}
                          className="rounded-lg bg-surface-muted p-3 text-sm text-brand-gray"
                        >
                          {new Date(n.createdAt).toLocaleDateString("ar-SA")} — {n.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-brand-gray">لا توجد ملاحظات بعد</p>
                  )}
                </div>

              </div>

            )}



            {activeTab === "sessions" && (

              <div className="card-section space-y-4">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <h4 className="flex items-center justify-end gap-2 text-lg font-bold text-primary">

                    <Calendar className="h-5 w-5" />

                    {guideCopy.sessionsCardTitle}

                  </h4>

                  <div className="flex flex-wrap gap-2">

                    <button

                      type="button"

                      onClick={() => setSessionDrawerOpen(true)}

                      className="btn-primary inline-flex !px-3 !py-2 text-sm"

                    >

                      <Plus className="h-4 w-4" />

                      {guideCopy.scheduleSessionDrawer}

                    </button>

                  </div>

                </div>



                {selected.sessions.length > 0 ? (

                  <div className="space-y-2">

                    <h5 className="font-bold text-primary">الجلسات السابقة والقادمة</h5>

                    {selected.sessions.map((s) => (

                      <div key={s.id} className="rounded-lg border border-surface-border bg-surface p-3 text-sm">

                        {editingSessionId === s.id ? (

                          <div className="space-y-2">

                            <label className="label-field">{guideCopy.sessionDateLabel}</label>

                            <input type="datetime-local" value={editSessionDate} onChange={(e) => setEditSessionDate(e.target.value)} className="input-field" dir="ltr" />

                            <label className="label-field">{guideCopy.meetingLinkLabel}</label>

                            <input type="url" value={editSessionMeetingLink} onChange={(e) => setEditSessionMeetingLink(e.target.value)} className="input-field" dir="ltr" />

                            <label className="label-field">{guideCopy.locationLabel}</label>

                            <input type="text" value={editSessionLocation} onChange={(e) => setEditSessionLocation(e.target.value)} className="input-field" />

                            <label className="label-field">حالة الجلسة</label>

                            <select value={editSessionStatus} onChange={(e) => setEditSessionStatus(e.target.value as SessionStatus)} className="input-field">

                              <option value="SCHEDULED">مجدولة</option>

                              <option value="ATTENDED">حضر</option>

                              <option value="MISSED">غاب</option>

                              <option value="COMPLETED">مكتملة</option>

                              <option value="CANCELED">ملغاة</option>

                            </select>

                            <label className="label-field">{guideCopy.commitmentRating}</label>

                            <input type="number" min={1} max={5} value={editSessionRating} onChange={(e) => setEditSessionRating(e.target.value)} className="input-field" dir="ltr" />

                            <label className="label-field">{guideCopy.sessionNotesLabel}</label>

                            <textarea value={editSessionNotes} onChange={(e) => setEditSessionNotes(e.target.value)} rows={2} className="input-field resize-none" />

                            <div className="flex gap-2">

                              <button type="button" onClick={handleUpdateSession} disabled={pending} className="btn-primary flex-1 !py-2 text-sm">حفظ</button>

                              <button type="button" onClick={() => setEditingSessionId(null)} className="btn-secondary flex-1 !py-2 text-sm">إلغاء</button>

                            </div>

                          </div>

                        ) : attendingSessionId === s.id ? (

                          <div className="space-y-2">

                            <p className="text-sm font-semibold text-primary">{guideCopy.commitmentRatingPrompt}</p>

                            <input type="number" min={1} max={5} value={attendRating} onChange={(e) => setAttendRating(e.target.value)} className="input-field" dir="ltr" placeholder="1–5" />

                            <div className="flex gap-2">

                              <button type="button" onClick={() => handleMarkAttended(s.id)} disabled={pending} className="btn-primary flex-1 !py-2 text-sm">{guideCopy.markAttended}</button>

                              <button type="button" onClick={() => { setAttendingSessionId(null); setAttendRating(""); }} className="btn-secondary flex-1 !py-2 text-sm">إلغاء</button>

                            </div>

                          </div>

                        ) : (

                          <div className="flex justify-between gap-2">

                            <div className="flex flex-wrap gap-1">

                              {s.status === "SCHEDULED" && (

                                <button

                                  type="button"

                                  onClick={() => { setAttendingSessionId(s.id); setAttendRating(""); }}

                                  className="btn-primary !px-3 !py-1 text-xs"

                                >

                                  {guideCopy.markAttended}

                                </button>

                              )}

                              <button type="button" onClick={() => startEditSession(s)} className="text-primary" title={guideCopy.editSession}><Pencil className="h-4 w-4" /></button>

                              <button type="button" onClick={() => handleDeleteSession(s.id)} className="text-red-600" title={guideCopy.deleteSession}><Trash2 className="h-4 w-4" /></button>

                            </div>

                            <div className="text-right">

                              <span className="font-semibold text-primary">{SESSION_STATUS_LABELS[s.status as SessionStatus]}</span>

                              <span className="mx-2 text-brand-gray">·</span>

                              {new Date(s.date).toLocaleString("ar-SA")}

                              {s.meetingLink && (

                                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-brand-gray">

                                  <Video className="h-3 w-3" />

                                  <span dir="ltr" className="truncate">{s.meetingLink}</span>

                                </p>

                              )}

                              {s.location && <p className="mt-1 text-xs text-brand-gray">{s.location}</p>}

                              {s.commitmentRating && <p className="text-xs text-brand-gray">تقييم: {s.commitmentRating}/5</p>}

                              {s.notes && <p className="mt-1 text-brand-gray">{s.notes}</p>}

                            </div>

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="text-sm text-brand-gray">لا توجد جلسات مجدولة — استخدم زر الجدولة لإضافة جلسة</p>

                )}

              </div>

            )}

            {activeTab === "tasks" && selected && (() => {
              const currentTasks = selected.tasks.filter((t) => !t.isCompleted);
              const completedTasks = selected.tasks.filter((t) => t.isCompleted);

              function renderTaskItem(t: BeneficiaryTask) {
                return (
                  <li key={t.id} className="rounded-lg border border-surface-border px-3 py-2">
                    {editingTaskId === t.id ? (
                      <div className="space-y-2">
                        <label className="label-field">{guideCopy.taskTitleLabel}</label>
                        <input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} className="input-field" />
                        <label className="label-field">{guideCopy.taskDescriptionLabel}</label>
                        <textarea value={editTaskDescription} onChange={(e) => setEditTaskDescription(e.target.value)} rows={2} className="input-field resize-none" />
                        <div className="flex gap-2">
                          <button type="button" onClick={handleUpdateTask} disabled={pending} className="btn-primary flex-1 !py-2 text-sm">حفظ</button>
                          <button type="button" onClick={() => setEditingTaskId(null)} className="btn-secondary flex-1 !py-2 text-sm">إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => startEditTask(t)} className="text-primary" title={guideCopy.editTask}><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDeleteTask(t.id)} className="text-red-600" title={guideCopy.deleteTask}><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${t.isCompleted ? "line-through opacity-60" : "text-primary"}`}>{t.title}</span>
                          {t.description && <p className="mt-1 text-xs text-brand-gray">{t.description}</p>}
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <div className="card-section space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-bold text-primary">{guideCopy.tasksCardTitle}</h4>
                    <button
                      type="button"
                      onClick={() => setTaskDrawerOpen(true)}
                      className="btn-primary inline-flex !px-3 !py-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {guideCopy.addNewTask}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="border-b border-surface-border pb-2">
                      <h5 className="mb-2 text-sm font-bold text-primary">{guideCopy.currentTasks}</h5>
                      {currentTasks.length === 0 ? (
                        <p className="text-sm text-brand-gray">لا توجد مهام حالية</p>
                      ) : (
                        <ul className="space-y-2">{currentTasks.map(renderTaskItem)}</ul>
                      )}
                    </div>

                    <div className="pt-1">
                      <h5 className="mb-2 text-sm font-bold text-brand-gray">{guideCopy.completedTasks}</h5>
                      {completedTasks.length === 0 ? (
                        <p className="text-sm text-brand-gray">لا توجد مهام منجزة</p>
                      ) : (
                        <ul className="space-y-2">{completedTasks.map(renderTaskItem)}</ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}



            {activeTab === "evaluations" && selected && (

              <GuideEvaluationsTab

                beneficiaryId={selected.id}

                professionalRecommendations={selected.professionalRecommendations}

                selectedCourseIds={selected.selectedTrainingCourseIds}

                trainingCourses={trainingCourses}

                onSaved={(recs, courseIds) =>

                  syncBeneficiary(selected.id, {

                    professionalRecommendations: recs,

                    selectedTrainingCourseIds: courseIds,

                  })

                }

              />

            )}

          </div>

        </div>

      );
      })()}

      {selected && (
        <>
          <SlideOver
            open={taskDrawerOpen}
            onClose={() => setTaskDrawerOpen(false)}
            title={guideCopy.addNewTask}
          >
            <div className="space-y-3">
              <label className="label-field">{guideCopy.taskTitleLabel}</label>
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="input-field"
                placeholder="مهمة جديدة..."
              />
              <label className="label-field">{guideCopy.taskDescriptionLabel}</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
              <SubmitButton
                type="button"
                onClick={handleCreateTask}
                loading={pending}
                disabled={!newTaskTitle.trim()}
                className="btn-primary flex w-full !py-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                {guideCopy.addTask}
              </SubmitButton>
            </div>
          </SlideOver>

          <SlideOver
            open={sessionDrawerOpen}
            onClose={() => setSessionDrawerOpen(false)}
            title={guideCopy.scheduleSessionDrawer}
          >
            <div className="space-y-3">
              <label htmlFor="session-date-drawer" className="label-field">{guideCopy.sessionDateLabel}</label>
              <input
                id="session-date-drawer"
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="input-field"
                dir="ltr"
              />
              <label htmlFor="session-meeting-link-drawer" className="label-field">{guideCopy.meetingLinkLabel}</label>
              <input
                id="session-meeting-link-drawer"
                type="url"
                value={sessionMeetingLink}
                onChange={(e) => setSessionMeetingLink(e.target.value)}
                className="input-field"
                dir="ltr"
                placeholder="https://..."
              />
              <label htmlFor="session-location-drawer" className="label-field">{guideCopy.locationLabel}</label>
              <input
                id="session-location-drawer"
                type="text"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                className="input-field"
                placeholder="مثال: مقر الجمعية — الطابق الثاني"
              />
              <label htmlFor="session-notes-drawer" className="label-field">{guideCopy.sessionNotesLabel}</label>
              <textarea
                id="session-notes-drawer"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="اختياري"
              />
              <SubmitButton
                type="button"
                onClick={handleScheduleSession}
                loading={pending}
                disabled={!sessionDate}
                className="btn-primary w-full !py-2 text-sm"
              >
                {guideCopy.scheduleSession}
              </SubmitButton>
            </div>
          </SlideOver>
        </>
      )}

    </>

  );

}

