import DashboardShell from "@/components/layout/DashboardShell";

const stats = [
  "Courses",
  "Lessons",
  "Quizzes",
  "Blog Posts",
] as const;

export default function ContentManagerDashboard() {
  return (
    <DashboardShell
      allowedRoles={["Content Manager"]}
      title="Content Manager"
      description="Manage platform courses, lessons, quizzes and blog content."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {item}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              —
            </p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}