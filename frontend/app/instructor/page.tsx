import DashboardShell from "@/components/layout/DashboardShell";

export default function InstructorDashboard() {
  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title="Instructor Dashboard"
      description="Manage your own courses, lessons, quizzes and student progress."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            My Courses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Lessons
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Student Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            —
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}