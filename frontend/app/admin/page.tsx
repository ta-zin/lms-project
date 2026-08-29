import DashboardShell from "@/components/layout/DashboardShell";

const stats = [
  "Total Users",
  "Students",
  "Instructors",
  "Courses",
] as const;

export default function AdminDashboard() {
  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Admin Dashboard"
      description="Manage users, roles, courses, lessons and platform content."
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