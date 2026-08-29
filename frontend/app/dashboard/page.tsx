import DashboardShell from "@/components/layout/DashboardShell";

export default function StudentDashboard() {
  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Student Dashboard"
      description="Continue learning, complete lessons and track your progress."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Enrolled Courses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Completed Lessons
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Average Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}